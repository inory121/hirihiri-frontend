<template>
  <!--  <div class="file-upload">-->
  <!--    <div class="file-upload-wrap">-->

  <!--      <div class="upload-text">拖拽到此处也可上传</div>-->
  <!--      <el-button type="primary" class="upload-btn" @click="triggerFileInput"> 开始上传</el-button>-->
  <!--      <input-->
  <!--        accept=".mp4,.webm"-->
  <!--        ref="fileInput"-->
  <!--        type="file"-->
  <!--        @change="handleFileSelect"-->
  <!--        style="display: none"-->
  <!--      />-->
  <el-upload
    class="file-upload"
    ref="uploadRef"
    action="#"
    :accept="'.mp4,.webm'"
    :show-file-list="false"
    :auto-upload="false"
    :before-upload="beforeUpload"
    :on-change="handleFileChange"
    drag
  >
    <template #trigger>
      <el-icon class="upload-icon" size="40">
        <Upload />
      </el-icon>
      <div class="upload-text">拖拽到此处也可上传</div>
      <el-button type="primary" class="upload-btn">上传视频</el-button>
      <div class="upload-audit-progress">
        <span>当前审核队列</span>
        <span class="tag">龟速</span>
      </div>
    </template>
  </el-upload>

  <!--    </div>-->
  <!--  </div>-->
  <div class="footer-item">
    <span class="item-list">禁止发布的视频内容</span>
    <span class="item-list">视频大小</span>
    <span class="item-list">视频格式</span>
    <span class="item-list">视频码率</span>
  </div>
  <div class="footer-item">
    <span class="item-list"
      >上传视频，即表示您已同意 <a href="#">HiriHiri使用协议</a> 与
      <a href="#">HiriHiri社区公约</a> ，请勿上传色情，反动等违法视频。</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'
import { useUploadStore } from '@/stores/uploadStore.ts'
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus'

const uploadStore = useUploadStore()
const uploadRef = ref()

const beforeUpload = (rawFile: UploadRawFile) => {
  if (!rawFile) {
    ElMessage.error('无效的文件')
    return false
  }

  // 校验MIME类型
  const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm']
  if (!ALLOWED_MIME_TYPES.includes(rawFile.type)) {
    ElMessage.error('仅支持 MP4/WebM 格式视频')
    return false
  }

  // 校验扩展名
  const fileExtension = rawFile.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['mp4', 'webm'].includes(fileExtension)) {
    ElMessage.error('文件扩展名不合法')
    return false
  }

  // 校验文件大小
  if (rawFile.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    ElMessage.error(`文件大小不能超过${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`)
    return false
  }

  // 通过所有校验
  return true
}

const handleFileChange = (file: UploadFile) => {
  if (!file || !file.raw) {
    ElMessage.error('文件读取失败')
    return
  }

  // 手动触发上传逻辑
  if (file.status === 'ready') {
    uploadStore.file = file.raw as File
    uploadStore.changeIsShow()
    startUpload()

    // 清空已选文件（允许重复选择同一文件）
    nextTick(() => {
      uploadRef.value?.clearFiles()
    })
  }
}

const UPLOAD_CONFIG = {
  CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
  CONCURRENT_LIMIT: 3, // 并发数
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
}

// const triggerFileInput = () => {
//   fileInput.value?.click() // 通过ref触发文件选择
// }

// 初始化上传
const initUpload = async () => {
  await post<BaseResponse<string>>('/upload/init').then((res) => {
    uploadStore.uploadId = res.data
  })
}

// 上传单个分片
const uploadChunk = async (chunk: Blob, chunkNumber: number, totalChunks: number) => {
  try {
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('uploadId', uploadStore.uploadId)
    formData.append('chunkNumber', chunkNumber.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('fileName', uploadStore.file!.name)

    const response = await post<BaseResponse>('/upload/chunk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response.code !== 200) return chunkNumber
  } catch (err) {
    console.error(`分片 ${chunkNumber} 上传失败:`, err)
    throw err
  }
}

// 分片上传管理
const startUpload = async () => {
  if (!uploadStore.file) return
  await initUpload()
  const totalChunks = Math.ceil(uploadStore.file.size / UPLOAD_CONFIG.CHUNK_SIZE)
  const chunks = Array.from({ length: totalChunks }, (_, i) => i)
  let completedChunks = 0 // 新增完成计数器
  // 并发控制上传
  const queue = []
  for (let i = 0; i < chunks.length; i += UPLOAD_CONFIG.CONCURRENT_LIMIT) {
    const chunkGroup = chunks.slice(i, i + UPLOAD_CONFIG.CONCURRENT_LIMIT)
    queue.push(
      Promise.all(
        chunkGroup.map(async (chunkIndex) => {
          const start = chunkIndex * UPLOAD_CONFIG.CHUNK_SIZE
          const end = Math.min(start + UPLOAD_CONFIG.CHUNK_SIZE, uploadStore.file!.size)
          const chunk = uploadStore.file!.slice(start, end)
          await uploadChunk(chunk, chunkIndex + 1, totalChunks)
          completedChunks++
          uploadStore.progress = Math.floor((completedChunks / totalChunks) * 100)
        }),
      ),
    )
  }
  await Promise.all(queue)
}

// 文件选择处理
// const handleFileSelect = (e: Event) => {
//   const input = e.target as HTMLInputElement
//   const selectedFile = input.files?.[0]
//   if (!selectedFile) {
//     ElMessage.warning('请选择文件')
//     return
//   }
//   // 严格校验文件类型（基于MIME类型而非扩展名）
//   const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm']
//   if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
//     ElMessage.error('仅支持 MP4/WebM 格式视频')
//     input.value = '' // 清空选择
//     return
//   }
//
//   // 双重校验扩展名（防止伪造MIME类型）
//   const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
//   if (!['mp4', 'webm'].includes(fileExtension || '')) {
//     ElMessage.error('文件扩展名不合法')
//     input.value = ''
//     return
//   }
//   if (selectedFile.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
//     ElMessage.error(`文件大小不能超过${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`)
//     return
//   }
//   uploadStore.file = selectedFile
//   uploadStore.changeIsShow()
//   startUpload()
// }
</script>
<style lang="less" scoped>
.file-upload {
  max-width: 830px;
  margin: 20px auto 0;
  color: #999;

  :deep(.el-upload-dragger) {
    border: 2px dashed #ccc;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .upload-text {
    margin: 16px 0;
    font-size: 13px;
  }

  .upload-btn {
    width: 200px;
    height: 44px;
    margin-bottom: 20px;
  }

  .upload-audit-progress {
    font-size: 13px;
    margin: 0 auto;

    .tag {
      background: rgb(228, 31, 31);
      border-radius: 2px;
      margin-left: 8px;
      padding: 2px 8px;
      color: #fff;
    }
  }
}

.footer-item {
  font-size: 12px;
  text-align: center;
  margin-top: 20px;
  color: #99a2aa;

  .item-list {
    margin: 0 10px;
  }

  a {
    color: #409eff;
  }
}
</style>
