<!-- FileUpload.vue -->
<template>
  <div>
    <input type="file" @change="handleFileSelect" />
    <button @click="startUpload">开始上传</button>
    <div>进度：{{ progress }}%</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB 分片
const CONCURRENT_LIMIT = 3 // 并发数
const uploadId = ref('')
const file = ref<File | null>(null)
const progress = ref(0)

// 初始化上传
const initUpload = async () => {
  await post<BaseResponse<string>>('/upload/init').then((res) => {
    uploadId.value = res.data
  })
}

// 上传单个分片
const uploadChunk = async (chunk: Blob, chunkNumber: number, totalChunks: number) => {
  const formData = new FormData()
  formData.append('file', chunk)
  formData.append('uploadId', uploadId.value)
  formData.append('chunkNumber', chunkNumber.toString())
  formData.append('totalChunks', totalChunks.toString())
  formData.append('fileName', file.value!.name)

  await post('/upload/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 分片上传管理
const startUpload = async () => {
  if (!file.value) return

  // 尝试恢复上传
  // const data = await post('/upload/resume-check', null, {
  //   params: { uploadId: uploadId.value },
  // })

  // if (data.resumable) {
  //   const confirm = await ElMessageBox.confirm(
  //     `发现未完成的上传（已上传${data.progress.toFixed(1)}%），是否继续?`,
  //     '提示',
  //     { type: 'warning' },
  //   )
  //
  //   if (confirm) {
  //     uploadId.value = data.uploadId
  //     progress.value = data.progress
  //   } else {
  //     await initUpload(file.value.name)
  //   }
  // }
  // else {
  await initUpload(file.value.name)
  const totalChunks = Math.ceil(file.value.size / CHUNK_SIZE)
  const chunks = Array.from({ length: totalChunks }, (_, i) => i)

  // 并发控制上传
  const queue = []
  for (let i = 0; i < chunks.length; i += CONCURRENT_LIMIT) {
    const chunkGroup = chunks.slice(i, i + CONCURRENT_LIMIT)
    queue.push(
      Promise.all(
        chunkGroup.map(async (chunkIndex) => {
          const start = chunkIndex * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.value!.size)
          const chunk = file.value!.slice(start, end)
          await uploadChunk(chunk, chunkIndex + 1, totalChunks)
          progress.value = Math.floor(((chunkIndex + 1) / totalChunks) * 100)
        }),
      ),
    )
  }

  await Promise.all(queue)
  await post<BaseResponse>('/upload/complete', null, {
    params: { uploadId: uploadId.value, fileName: file.value.name },
  }).then((res) => {
    if (res.code == 200) {
      ElMessage.success(res.message)
    } else if (res.code == 500) {
      ElMessage.error(res.message)
    }
  })
  // }
}
// await initUpload(file.value.name)

// 文件选择处理
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    file.value = input.files[0]
    console.log(file.value)
  }
}
</script>
