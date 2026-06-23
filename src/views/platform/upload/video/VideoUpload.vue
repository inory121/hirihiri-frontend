<template>
  <!-- 草稿提示横幅 -->
  <div v-if="uploadStore.draft" class="draft-banner">
    <el-icon class="draft-icon"><InfoFilled /></el-icon>
    <span class="draft-text">
      本地浏览器存在1个未提交的视频（{{ uploadStore.draft.fileName }}）
    </span>
    <div class="draft-actions">
      <el-button type="primary" link @click="onResumeClick">继续上传</el-button>
      <el-button type="info" link @click="onDiscardDraft">不用了</el-button>
    </div>
  </div>

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
import { useUploadStore } from '@/stores/uploadStore.ts'
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const uploadStore = useUploadStore()
const uploadRef = ref()

const beforeUpload = (rawFile: UploadRawFile) => {
  if (!rawFile) {
    ElMessage.error('无效的文件')
    return false
  }
  const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm']
  if (!ALLOWED_MIME_TYPES.includes(rawFile.type)) {
    ElMessage.error('仅支持 MP4/WebM 格式视频')
    return false
  }
  const fileExtension = rawFile.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['mp4', 'webm'].includes(fileExtension)) {
    ElMessage.error('文件扩展名不合法')
    return false
  }
  if (rawFile.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    ElMessage.error(`文件大小不能超过${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`)
    return false
  }
  return true
}

// 点击「继续上传」— 先检查是否已完成上传，再决定是否打开文件选择框
const onResumeClick = async () => {
  // 先检查是否可以直接跳转（所有分片已上传）
  const canDirectResume = await uploadStore.checkAndResumeDirectly()

  if (canDirectResume) {
    // 所有分片已上传，checkAndResumeDirectly 内部已调用 changeIsShow(false)
    return
  }

  // 还有分片未上传，继续原有逻辑：标记续传 + 弹出文件选择框
  uploadStore.markShouldResume()
  const fileInput = uploadRef.value?.$el?.querySelector?.('input[type="file"]')
  if (fileInput) {
    fileInput.click()
  } else {
    uploadRef.value?.inputRef?.click?.()
  }
}

// 点击「不用了」— 清草稿 + 通知后端删 tmp
const onDiscardDraft = async () => {
  await uploadStore.cancelUpload()
}

const handleFileChange = async (file: UploadFile) => {
  if (!file || !file.raw) {
    ElMessage.error('文件读取失败')
    return
  }
  if (file.status !== 'ready') return

  uploadStore.file = file.raw as File
  uploadStore.fileSize = file.raw.size

  const draft = uploadStore.draft
  const isSameFile = draft && draft.fileName === file.name && draft.fileSize === file.raw.size

  if (isSameFile && uploadStore.shouldResume) {
    // 明确点了"继续编辑"且文件匹配 — 进入续传
    uploadStore.changeIsShow()
    const total = await uploadStore.resumeUpload(file.raw as File)
    if (total) {
      await startUpload(total)
    } else {
      // 续传失败（后端分片已清理），退化为重新上传
      await uploadStore.initUpload()
      const newTotal = Math.ceil(file.raw.size / UPLOAD_CONFIG.CHUNK_SIZE)
      await startUpload(newTotal)
    }
  } else if (isSameFile && !uploadStore.shouldResume) {
    // 没点过"继续编辑"但文件匹配 — 默认直接重新上传
    uploadStore.clearDraft()
    uploadStore.changeIsShow()
    await uploadStore.initUpload()
    const total = Math.ceil(file.raw.size / UPLOAD_CONFIG.CHUNK_SIZE)
    await startUpload(total)
  } else {
    // 没有草稿或文件不匹配 — 全新上传
    // 如果有草稿且选择了不同文件，需要先清理后端缓存
    if (draft) {
      await uploadStore.cancelUpload()
      // cancelUpload 会把 file 设为 null，需要重新设置
      uploadStore.file = file.raw as File
      uploadStore.fileSize = file.raw.size
    }
    uploadStore.changeIsShow()
    await uploadStore.initUpload()
    const total = Math.ceil(file.raw.size / UPLOAD_CONFIG.CHUNK_SIZE)
    await startUpload(total)
  }

  await nextTick(() => {
    uploadRef.value?.clearFiles()
  })
}

const UPLOAD_CONFIG = {
  CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
  CONCURRENT_LIMIT: 3,
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
}

const startUpload = async (totalChunks: number) => {
  if (!uploadStore.file) return

  const chunks = Array.from({ length: totalChunks }, (_, i) => i)
  const queue = []
  for (let i = 0; i < chunks.length; i += UPLOAD_CONFIG.CONCURRENT_LIMIT) {
    const chunkGroup = chunks.slice(i, i + UPLOAD_CONFIG.CONCURRENT_LIMIT)
    queue.push(
      Promise.all(
        chunkGroup.map(async (chunkIndex) => {
          const start = chunkIndex * UPLOAD_CONFIG.CHUNK_SIZE
          const end = Math.min(start + UPLOAD_CONFIG.CHUNK_SIZE, uploadStore.file!.size)
          const chunk = uploadStore.file!.slice(start, end)
          await uploadStore.uploadChunk(chunk, chunkIndex + 1, totalChunks)
        }),
      ),
    )
  }
  await Promise.all(queue)
  // 全部处理完成后兜底校验：如果进度已达 100%，确保上传状态标记为成功
  // （续传模式下所有分片已上传时，uploadChunk 会被全部跳过，不会自行标记成功）
  if (uploadStore.progress >= 100) {
    uploadStore.isFileUploadSuccess = true
  }
}
</script>

<style lang="less" scoped>
.draft-banner {
  max-width: 830px;
  margin: 10px auto 0;
  padding: 12px 16px;
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1d4ed8;

  .draft-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .draft-text {
    flex: 1;
    color: #1e3a8a;
  }

  .draft-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

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
