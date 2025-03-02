import { defineStore } from 'pinia'
import { post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'

export const useUploadStore = defineStore('upload', {
  state: () => {
    return {
      isShow: true, //true为展示投稿界面，false为展示稿件详情页
      file: null as File | null, // 上传的文件
      progress: 0, // 上传进度条
      uploadId: '', // 上传id
      loading: false, // 上传按钮加载状态
      coverFile: null as File | null, // 封面文件
      coverUrlBase64: '', // 裁剪后的封面
      originalCover: '', // 原始封面字段
      selectCoverUrlBase64: '', // 手动上传裁剪后的封面
      selectOriginalCover: '', // 手动上传原始封面字段
      VideoInfo: {
        auth: 0,
        coverUrl: '',
        delDate: '',
        descr: '',
        duration: 0,
        mcId: '',
        pubDate: '',
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
  getters: {},
  actions: {
    changeIsShow() {
      this.isShow = !this.isShow
      this.resetFormState()
    },
    resetFormState() {
      this.VideoInfo = {
        ...this.VideoInfo, // 保留不需要重置的字段
        tags: [],
        title: '',
        mcId: '',
        scId: '',
        descr: '',
        type: 1,
      }
      this.coverFile = null
      this.coverUrlBase64 = ''
    },
    confirmUpload() {
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
      if (this.progress === 100) {
        const formData = new FormData()
        formData.append('coverFile', this.coverFile!)
        const newVideoInfo = {
          ...this.VideoInfo, // 浅拷贝对象
          tags: this.VideoInfo.tags.join('\n'), // 替换 tags
        }
        formData.append('videoInfo', JSON.stringify(newVideoInfo))
        formData.append('uploadId', this.uploadId)
        formData.append('fileName', this.file!.name)
        post<BaseResponse>('/upload/complete', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then((res) => {
            if (res.code === 200) {
              ElMessage.success(res.message)
              this.resetFormState()
            } else if (res.code === 500) {
              ElMessage.error(res.message)
            }
          })
          .finally(() => {
            this.loading = false
            this.changeIsShow()
          })
      }
    },
  },
})
