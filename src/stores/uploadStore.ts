import { defineStore } from 'pinia'
import { get, post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'
import { VIDEO_UPLOAD_API } from '@/api/video/upload.ts'
import { ElMessage } from 'element-plus'

// localStorage key（按用户id隔离更安全，这里简化用固定key）
const UPLOAD_DRAFT_KEY = 'upload_draft_v1'
// 草稿过期时间：7 天
const DRAFT_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000

interface VideoInfoDraft {
  title: string
  descr: string
  mcId: string
  scId: string
  type: number
  auth: number
  tags: string[]
  duration: number
  coverUrlBase64: string
}

interface UploadDraft {
  uploadId: string
  fileName: string
  fileSize: number
  totalChunks: number
  uploadedChunkNumbers: number[]
  videoInfo: VideoInfoDraft
  savedAt: number
}

interface UploadStatusResponse {
  exists: boolean
  uploadedChunks: number[]
  fileName: string
  totalChunks: number
}

// 从 localStorage 加载草稿（非响应式工具函数）
function loadDraftFromStorage(): UploadDraft | null {
  try {
    const raw = localStorage.getItem(UPLOAD_DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as UploadDraft
    if (!draft || !draft.uploadId) return null
    if (Date.now() - draft.savedAt > DRAFT_EXPIRE_MS) {
      localStorage.removeItem(UPLOAD_DRAFT_KEY)
      return null
    }
    return draft
  } catch {
    return null
  }
}

export const useUploadStore = defineStore('upload', {
  state: () => {
    return {
      isShow: true,
      file: null as File | null,
      fileSize: 0,
      progress: 0,
      isFileUploadSuccess: null as boolean | null,
      uploadId: '',
      loading: false,
      coverFile: null as File | null,
      coverUrlBase64: '',
      originalCover: '',
      selectCoverUrlBase64: '',
      selectOriginalCover: '',
      videoOnServer: false,
      // 续传模式标记
      isResumeMode: false,
      shouldResume: false,
      // ✅ 真正上传成功的分片号（服务端已落盘）：续传/非续传模式统一用它记账
      uploadedChunks: new Set<number>(),
      // 草稿状态（响应式：横幅 v-if 绑定它）
      draft: loadDraftFromStorage(),
      VideoInfo: {
        auth: 0,
        coverUrl: '',
        delDate: '',
        descr: '',
        duration: 0,
        mcId: '',
        createDate: '',
        scId: '',
        status: 1,
        tags: [] as string[],
        title: '',
        type: 1,
        uid: 0,
        vid: 0,
        videoUrl: '',
      },
    }
  },
  getters: {
    hasDraft(): UploadDraft | null {
      return this.draft
    },
    // 是否处于"有未完成工作"的状态（用于离开页面提示）
    // 触发条件：有草稿 || 有上传ID || 有上传进度 || 已选择了文件
    hasUnfinishedWork(): boolean {
      return !!this.draft || this.uploadId !== '' || this.progress > 0 || !!this.file
    },
  },
  actions: {
    changeIsShow(resetForm: boolean = true) {
      this.isShow = !this.isShow
      if (resetForm) {
        this.resetFormState()
      }
    },
    resetFormState() {
      this.VideoInfo = {
        ...this.VideoInfo,
        tags: [],
        title: '',
        mcId: '',
        scId: '',
        descr: '',
        type: 1,
      }
      this.coverFile = null
      this.coverUrlBase64 = ''
      this.originalCover = ''
      this.selectCoverUrlBase64 = ''
      this.selectOriginalCover = ''
      this.videoOnServer = false
      this.isResumeMode = false
      this.uploadedChunks = new Set()
      this.shouldResume = false
    },
    saveDraft(uploadedChunkNumbers: number[], totalChunks: number) {
      if (!this.uploadId || !this.file) return
      this._saveDraftInternal(uploadedChunkNumbers, totalChunks)
    },

    // 手动保存草稿（用户点击"存草稿"按钮时调用）
    saveDraftManually() {
      if (!this.uploadId) {
        ElMessage.error('请先上传视频')
        return
      }
      const uploaded = Array.from(this.uploadedChunks).sort((a, b) => a - b)
      this._saveDraftInternal(uploaded, this.draft?.totalChunks || 0)
      ElMessage.success('草稿已保存')
    },

    // 内部方法：实际保存草稿
    _saveDraftInternal(uploadedChunkNumbers: number[], totalChunks: number) {
      const draft: UploadDraft = {
        uploadId: this.uploadId,
        fileName: this.file?.name || '',
        fileSize: this.file?.size || 0,
        totalChunks,
        uploadedChunkNumbers,
        videoInfo: {
          title: this.VideoInfo.title,
          descr: this.VideoInfo.descr,
          mcId: this.VideoInfo.mcId,
          scId: this.VideoInfo.scId,
          type: this.VideoInfo.type,
          auth: this.VideoInfo.auth,
          tags: this.VideoInfo.tags,
          duration: this.VideoInfo.duration,
          coverUrlBase64: this.coverUrlBase64,
        },
        savedAt: Date.now(),
      }
      localStorage.setItem(UPLOAD_DRAFT_KEY, JSON.stringify(draft))
      this.draft = draft
    },
    // 完全清除草稿（前端 localStorage + 响应式 state）
    clearDraft() {
      localStorage.removeItem(UPLOAD_DRAFT_KEY)
      this.draft = null
      this.coverFile = null
      this.coverUrlBase64 = ''
      this.originalCover = ''
      this.selectCoverUrlBase64 = ''
      this.selectOriginalCover = ''
      this.isResumeMode = false
      this.uploadedChunks = new Set()
      this.shouldResume = false
      this.videoOnServer = false
      this.fileSize = 0
      this.file = null
    },
    markShouldResume() {
      this.shouldResume = true
    },

    // 内部方法：从草稿恢复 VideoInfo
    _restoreVideoInfoFromDraft(videoInfo: VideoInfoDraft) {
      this.VideoInfo.title = videoInfo.title || ''
      this.VideoInfo.descr = videoInfo.descr || ''
      this.VideoInfo.mcId = videoInfo.mcId || ''
      this.VideoInfo.scId = videoInfo.scId || ''
      this.VideoInfo.type = videoInfo.type ?? 1
      this.VideoInfo.auth = videoInfo.auth ?? 0
      this.VideoInfo.tags = videoInfo.tags || []
      this.VideoInfo.duration = videoInfo.duration || 0
      this.coverUrlBase64 = videoInfo.coverUrlBase64 || ''
      this.originalCover = videoInfo.coverUrlBase64 || ''
    },

    // 初始化上传（全新开始）
    async initUpload() {
      this.isFileUploadSuccess = null
      this.progress = 0
      this.coverFile = null
      this.coverUrlBase64 = ''
      this.originalCover = ''
      this.selectCoverUrlBase64 = ''
      this.selectOriginalCover = ''
      this.isResumeMode = false
      this.uploadedChunks = new Set()
      this.videoOnServer = false
      this.fileSize = 0
      await post<BaseResponse<string>>(VIDEO_UPLOAD_API.VIDEO_UPLOAD_INIT).then((res) => {
        this.uploadId = res.data
      })
    },

    // 查询上传状态（断点续传）
    async getUploadStatus(uploadId: string): Promise<UploadStatusResponse | null> {
      if (!uploadId) return null
      try {
        const res = await get<BaseResponse<UploadStatusResponse>>(
          VIDEO_UPLOAD_API.VIDEO_UPLOAD_STATUS,
          { params: { uploadId } },
        )
        return res.data
      } catch (e) {
        console.error('获取上传状态失败:', e)
        return null
      }
    },

    // 检查是否可以直接跳转投稿（所有分片已上传）
    async checkAndResumeDirectly(): Promise<boolean> {
      const draft = this.draft
      if (!draft) {
        return false
      }

      const status = await this.getUploadStatus(draft.uploadId)
      if (!status || !status.exists) {
        return false
      }

      const totalChunks = status.totalChunks || draft.totalChunks
      const uploadedCount = status.uploadedChunks?.length || 0

      if (uploadedCount >= totalChunks && totalChunks > 0) {
        // 创建一个虚拟的File对象，保留文件名信息用于显示
        // 故意不设置 size，保持为 0，这样 captureCover 可以识别为虚拟文件并跳过处理
        this.file = new File([], draft.fileName, { type: 'video/mp4' })
        this.fileSize = draft.fileSize || 0
        this.uploadId = draft.uploadId
        this.isResumeMode = true
        this.isFileUploadSuccess = true
        this.progress = 100
        this.shouldResume = false
        this.videoOnServer = true

        if (draft.videoInfo) {
          this._restoreVideoInfoFromDraft(draft.videoInfo)
        }

        ElMessage.success('检测到视频已上传完成，正在跳转投稿页面...')
        // 直接跳转，不重置表单状态以保留恢复的投稿信息
        this.changeIsShow(false)
        return true
      }

      return false
    },

    // 继续上传（从草稿恢复）
    async resumeUpload(file: File): Promise<number | null> {
      const draft = this.draft
      if (!draft) {
        ElMessage.error('未找到草稿，无法继续上传')
        return null
      }
      const status = await this.getUploadStatus(draft.uploadId)
      if (!status || !status.exists) {
        // 后端分片已清理，退化为全新上传
        this.clearDraft()
        ElMessage.warning('服务器上的临时文件已清理，开始重新上传')
        return null
      }
      this.file = file
      this.fileSize = file.size
      this.videoOnServer = false
      this.uploadId = draft.uploadId
      this.isResumeMode = true
      this.isFileUploadSuccess = null
      this.shouldResume = false
      // ✅ 续传时以服务端返回的真实分片为准（前端草稿可能因并发记账不准）
      this.uploadedChunks = new Set(status.uploadedChunks)
      if (draft.videoInfo) {
        this._restoreVideoInfoFromDraft(draft.videoInfo)
      }
      const totalChunks = draft.totalChunks
      const done = this.uploadedChunks.size
      this.progress = Math.floor((done / totalChunks) * 100)
      // 如果所有分片都已上传，直接标记为上传成功（避免页面显示"上传失败"）
      if (done >= totalChunks) {
        this.isFileUploadSuccess = true
      }
      return totalChunks
    },

    // 上传单个分片
    async uploadChunk(chunk: Blob, chunkNumber: number, totalChunks: number) {
      // ✅ 无论续传/非续传模式，只要 uploadedChunks 里已有这个分片（服务端落盘过），就跳过
      if (this.uploadedChunks.has(chunkNumber)) return
      try {
        const formData = new FormData()
        formData.append('file', chunk)
        formData.append('uploadId', this.uploadId)
        formData.append('chunkNumber', chunkNumber.toString())
        formData.append('totalChunks', totalChunks.toString())
        formData.append('fileName', this.file!.name)

        const response = await post<BaseResponse>(VIDEO_UPLOAD_API.VIDEO_UPLOAD_CHUNK, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (response.code == 200) {
          this.isFileUploadSuccess = true
          // ✅ 统一记账：只有真正上传成功的分片才计入 uploadedChunks
          this.uploadedChunks.add(chunkNumber)
          // ✅ 用 Set 里的真实列表保存草稿（不再用 [1..chunkNumber] 的虚假假设）
          const uploaded = Array.from(this.uploadedChunks).sort((a, b) => a - b)
          this.saveDraft(uploaded, totalChunks)
          this.progress = Math.floor((uploaded.length / totalChunks) * 100)
        } else {
          this.isFileUploadSuccess = false
          ElMessage.error(response.message)
        }
      } catch (err) {
        console.error(`分片 ${chunkNumber} 上传失败:`, err)
        throw err
      }
    },

    async confirmUpload() {
      if (this.progress < 100) {
        ElMessage.error('等待分片上传完成')
        return
      }
      if (!this.coverFile) {
        ElMessage.error('请上传封面')
        return
      }
      if (this.VideoInfo.title.trim().length === 0) {
        ElMessage.error('请填写标题')
        return
      }
      if (!this.VideoInfo.mcId || !this.VideoInfo.scId) {
        ElMessage.error('请选择分区')
        return
      }
      if (this.VideoInfo.tags.length === 0) {
        ElMessage.error('请填写标签')
        return
      }
      this.loading = true
      const formData = new FormData()
      formData.append('coverFile', this.coverFile!)
      const { ...payload } = {
        ...this.VideoInfo,
        tags: this.VideoInfo.tags.join('\n'),
      }
      formData.append('videoInfo', JSON.stringify(payload))
      formData.append('uploadId', this.uploadId)
      formData.append('fileName', this.file!.name)
      await post<BaseResponse>(VIDEO_UPLOAD_API.VIDEO_UPLOAD_COMPLETE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success(res.message)
            this.resetFormState()
            this.clearDraft()
          } else if (res.code === 500) {
            ElMessage.error(res.message)
          }
        })
        .finally(() => {
          this.loading = false
          this.changeIsShow()
        })
    },

    // 取消上传（清草稿 + 清后端 tmp）
    async cancelUpload() {
      // 只要有 uploadId 或 draft 中存了 uploadId，就通知后端清理
      const targetUploadId = this.uploadId || this.draft?.uploadId || ''
      this.isFileUploadSuccess = null
      if (!targetUploadId) {
        // 没有任何后端资源需要清理，直接清前端草稿
        this.clearDraft()
        ElMessage.success('已清除草稿')
        return
      }
      try {
        const res = await post<BaseResponse>(
          `${VIDEO_UPLOAD_API.VIDEO_UPLOAD_CANCEL}?uploadId=${encodeURIComponent(targetUploadId)}`,
        )
        if (res.code === 200) {
          ElMessage.success(res.message)
          this.clearDraft()
          // 清掉当前正在上传的状态
          this.uploadId = ''
          this.progress = 0
          this.file = null
        } else if (res.code === 500) {
          ElMessage.error(res.message)
        }
      } catch (err) {
        // 即使后端失败，也清前端草稿，避免卡死
        console.error('取消上传失败:', err)
        this.clearDraft()
        this.uploadId = ''
        this.progress = 0
        this.file = null
        ElMessage.success('已清除草稿')
      }
    },
  },
})
