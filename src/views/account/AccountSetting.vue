<template>
  <div class="account-setting">
    <div class="page-card">
      <h2 class="page-title">我的信息</h2>
      <el-form
        label-position="right"
        label-width="92px"
        label-suffix="："
        class="setting-form"
        @submit.prevent
      >
        <el-form-item label="用户名">
          <span class="username-text">{{ displayUsername }}</span>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="form.nickname"
            maxlength="50"
            show-word-limit
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :value="0">私密</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
            placeholder="写一句自我介绍吧"
          />
        </el-form-item>
        <el-form-item label="主页背景">
          <div class="background-field">
            <div v-if="form.background" class="background-preview">
              <img :src="form.background" alt="背景预览" />
              <button type="button" class="background-remove" @click="form.background = ''">
                移除
              </button>
            </div>
            <el-button v-else :loading="backgroundUploading" @click="backgroundInputRef?.click()">
              上传背景图
            </el-button>
            <input
              ref="backgroundInputRef"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              class="hidden-file-input"
              @change="handleBackgroundSelect"
            />
            <p class="field-tip">支持 jpg / png / webp，大小不超过 5MB</p>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.ts'
import { uploadImage } from '@/utils/upload.ts'

const userStore = useUserStore()

const form = reactive({
  nickname: userStore.user.nickname || '',
  sex: userStore.user.sex ?? 0,
  description: userStore.user.description || '',
  background: userStore.user.background || '',
})

const saving = ref(false)
const backgroundUploading = ref(false)
const backgroundInputRef = ref<HTMLInputElement | null>(null)

// 用户名只读展示（不参与提交）
const displayUsername = ref(userStore.user.username || '')

// 用户信息异步加载完成后回填一次（直开 /account/setting 时 store 可能还没数据）
watch(
  () => userStore.user.uid,
  (uid) => {
    if (!uid) return
    displayUsername.value = userStore.user.username || ''
    form.nickname = userStore.user.nickname || ''
    form.sex = userStore.user.sex ?? 0
    form.description = userStore.user.description || ''
    form.background = userStore.user.background || ''
  },
)

async function handleBackgroundSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  backgroundUploading.value = true
  const url = await uploadImage(file, 'background')
  backgroundUploading.value = false
  if (url) form.background = url
}

async function handleSave() {
  const nickname = form.nickname.trim()
  if (!nickname || nickname.length > 50) {
    ElMessage.warning('昵称长度需在1-50之间')
    return
  }
  if (form.description.trim().length > 100) {
    ElMessage.warning('个性签名长度不能超过100')
    return
  }
  saving.value = true
  await userStore.updateProfile({
    nickname,
    sex: form.sex,
    description: form.description.trim(),
    background: form.background,
  })
  saving.value = false
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

.setting-form {
  max-width: 560px;

  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

.username-text {
  font-size: 14px;
  color: @text-1;
}

.background-field {
  .background-preview {
    position: relative;
    width: 320px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .background-remove {
      position: absolute;
      right: 8px;
      top: 8px;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 12px;
      color: #fff;
      background: rgba(0, 0, 0, 0.55);
      cursor: pointer;

      &:hover {
        background: rgba(0, 0, 0, 0.75);
      }
    }
  }

  .field-tip {
    margin: 6px 0 0;
    font-size: 12px;
    color: #9499a0;
  }
}

.hidden-file-input {
  display: none;
}
</style>
