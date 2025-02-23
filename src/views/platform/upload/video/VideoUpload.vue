<!-- VideoUpload.vue -->
<template>
  <div class="file-upload">
    <div class="file-upload-wrap">
      <el-icon class="upload-icon">
        <Upload />
      </el-icon>
      <div class="upload-text">拖拽到此处也可上传</div>
      <el-button type="primary" class="upload-btn" @click="triggerFileInput"> 开始上传</el-button>
      <input
        accept=".mp4,.flv,.avi,.wmv,.mov,.webm,.mpeg4,.ts,.mpg,.rm,.rmvb,.mkv,.m4v"
        ref="fileInput"
        type="file"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'
import { useUploadStore } from '@/stores/uploadStore.ts'
import { ElMessage } from 'element-plus'

const uploadStore = useUploadStore()
const fileInput = ref<HTMLInputElement | null>(null)
// const uploadId = ref('')

const UPLOAD_CONFIG = {
  CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
  CONCURRENT_LIMIT: 3, // 并发数
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
}

const triggerFileInput = () => {
  fileInput.value?.click() // 通过ref触发文件选择
}

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
  // if (uploadStore.progress == 100) {
  //   console.log(222)
  //   post<BaseResponse>('/upload/complete', null, {
  //     params: { uploadId: uploadId.value, fileName: uploadStore.file?.name },
  //   }).then((res) => {
  //     if (res.code == 200) {
  //       ElMessage.success(res.message)
  //     } else if (res.code == 500) {
  //       ElMessage.error(res.message)
  //     }
  //   })
  // }
}

// 文件选择处理
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const selectedFile = input.files?.[0]
  if (!selectedFile) {
    ElMessage.warning('请选择文件')
    return
  }
  if (selectedFile.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    ElMessage.error(`文件大小不能超过${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`)
    return
  }
  uploadStore.file = selectedFile
  uploadStore.changeIsShow()
  startUpload()
}
</script>
<style scoped>
.file-upload {
  border: 2px dashed #ccc;
  max-width: 830px;
  margin: 20px auto 0;
  color: #999;

  .file-upload-wrap {
    margin: 62px 0 32px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-icon {
      font-size: 40px;
    }

    .upload-text {
      margin: 16px 0;
      font-size: 13px;
    }

    .upload-btn {
      width: 200px;
      height: 44px;
    }
  }
}
</style>
