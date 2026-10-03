<template>
  <div class="account-avatar">
    <div class="page-card">
      <h2 class="page-title">我的头像</h2>
      <div class="avatar-field">
        <div class="avatar-preview-wrap">
          <img class="avatar-preview" :src="currentAvatar" alt="当前头像" />
          <div v-if="uploading" class="avatar-mask">
            <span>上传中...</span>
          </div>
        </div>
        <div class="avatar-actions">
          <el-button type="primary" :loading="uploading" @click="fileInputRef?.click()">
            更换头像
          </el-button>
          <p class="avatar-tip">支持 jpg / png / webp，大小不超过 5MB，上传后自动保存</p>
          <input
            ref="fileInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            class="hidden-file-input"
            @change="handleAvatarSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { DEFAULT_AVATAR } from '@/utils/constants'
import { uploadImage } from '@/utils/upload.ts'

const userStore = useUserStore()

const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const currentAvatar = computed(() => userStore.user.avatar || DEFAULT_AVATAR)

async function handleAvatarSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  const url = await uploadImage(file, 'avatar')
  if (url) {
    await userStore.updateProfile({ avatar: url })
  }
  uploading.value = false
}
</script>

<style scoped lang="less">
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  .page-title {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: @text-1;
  }
}

.avatar-field {
  display: flex;
  align-items: center;
  gap: 32px;

  .avatar-preview-wrap {
    position: relative;

    .avatar-preview {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      background: #f6f7f8;
    }

    .avatar-mask {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .avatar-actions {
    .avatar-tip {
      margin: 8px 0 0;
      font-size: 12px;
      color: #9499a0;
    }
  }
}

.hidden-file-input {
  display: none;
}
</style>
