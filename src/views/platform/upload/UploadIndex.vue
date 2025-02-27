<template>
  <!--  <div class="content" v-if="false">-->
  <div class="content" v-if="uploadStore.isShow">
    <!--    <div class="upload-nav">-->
    <!--      <router-link to="/platform/upload/video">-->
    <!--        <span class="upload-nav-item">视频投稿</span>-->
    <!--      </router-link>-->
    <!--      <span class="upload-nav-item">专栏投稿</span>-->
    <!--      <span class="upload-nav-item">音频投稿</span>-->
    <!--    </div>-->
    <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" :router="true">
      <el-menu-item index="/platform/upload/video">
        <span class="upload-nav-item">视频投稿</span>
      </el-menu-item>
      <el-menu-item index="/platform/upload/article">
        <span class="upload-nav-item">专栏投稿</span>
      </el-menu-item>
      <el-menu-item index="/platform/upload/audio">
        <span class="upload-nav-item">音频投稿</span>
      </el-menu-item>
    </el-menu>
    <router-view />
  </div>
  <div class="video-basic content" v-else>
    <div class="video-upload">
      <div class="upload-header">
        <span class="upload-header-top-text">发布视频</span>
        <div class="upload-header-top-btn">
          <el-button @click="uploadStore.changeIsShow">取消发布</el-button>
        </div>
      </div>
      <el-divider style="margin: 0" />
      <div class="file-item">
        <div class="file-item-icon">
          <el-icon color="#00a1d6">
            <VideoPlay />
          </el-icon>
        </div>
        <div class="file-item-content">
          <div class="title">{{ uploadStore.file?.name }}</div>
          <div v-if="uploadStore.progress != 100" class="file-item-content-status-text">
            <span class="upload-progress">当前进度{{ uploadStore.progress }}%</span>
          </div>
          <div class="file-item-content-status-text" v-else>
            <el-icon color="rgb(67, 206, 91)">
              <CircleCheckFilled />
            </el-icon>
            <span class="success">上传完成</span>
          </div>
          <el-progress
            :show-text="false"
            :stroke-width="6"
            :percentage="uploadStore.progress"
            style="width: 800px; margin-top: 5px"
          />
        </div>
      </div>
    </div>
    <el-form class="form" :model="uploadStore.VideoInfo" label-width="auto" style="width: 80%">
      <div class="title">
        <span>基本设置</span>
      </div>
      <el-form-item label="封面" :rules="[{ required: true }]">
        <el-image
          style="width: 192px; height: 108px; border-radius: 4px" fit="cover"
          :src="uploadStore.coverUrlBase64"
          :preview-src-list="[uploadStore.coverUrlBase64]"
          v-model="uploadStore.coverUrlBase64"
        ></el-image>
      </el-form-item>
      <el-form-item label="标题" :rules="[{ required: true }]">
        <el-input v-model="uploadStore.VideoInfo.title" maxlength="80" :show-word-limit="true" />
      </el-form-item>
      <el-form-item label="类型" :rules="[{ required: true }]">
        <el-radio-group v-model="uploadStore.VideoInfo.type">
          <el-radio :value="1">自制</el-radio>
          <el-radio :value="2">转载</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分区" :rules="[{ required: true }]">
        <el-cascader
          @change="handleCategoryChange"
          placeholder="请选择分区"
          :options="categoryStore.categories"
          filterable
        />
      </el-form-item>
      <!--标签输入框-->
      <el-form-item label="标签" :rules="[{ required: true }]">
        <el-input-tag
          v-model="rcmTag"
          draggable
          placeholder="按回车键Enter创建标签"
          @remove-tag="handleTagRemove"
        />
      </el-form-item>
      <!--标签展示区-->
      <div class="tag-wrp">
        <span class="recommend">推荐标签</span>
        <el-tag
          v-for="tag in rcmTags"
          :key="tag"
          :disable-transitions="false"
          @click="handleTagClick(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
      <el-form-item label="简介" class="desc">
        <el-input type="textarea" v-model="uploadStore.VideoInfo.descr" :rows="8"></el-input>
      </el-form-item>
      <div class="submit">
        <el-button style="width: 120px; height: 40px">存草稿</el-button>
        <el-button
          style="width: 120px; height: 40px"
          @click="uploadStore.confirmUpload()"
          type="primary"
          :loading="uploadStore.loading"
        >
          确认投稿
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useUploadStore } from '@/stores/uploadStore.ts'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import { useUserStore } from '@/stores/userStore.ts'
import type { CascaderValue } from 'element-plus'

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()
const rcmTag = ref<string[]>([]) // 标签输入框的内容
const rcmTags = ref<string[] | undefined>([
  '二次元',
  '孤独摇滚',
  'Cosplay',
  'MAD',
  '爱抖露',
  '爱莉希雅',
]) // 标签展示区的内容
// valueArr数组包含mcId和scId
const handleCategoryChange = (valueArr: CascaderValue) => {
  rcmTags.value = categoryStore.rcmTags(valueArr as string[])
  // 添加类型断言和校验
  if (!Array.isArray(valueArr)) return
  // 安全访问数组元素
  const [mcId = '', scId = ''] = valueArr as string[]
  uploadStore.VideoInfo.mcId = mcId
  uploadStore.VideoInfo.scId = scId
}

const handleTagClick = (tag: string) => {
  // 添加到rcmTag（自动去重）
  rcmTag.value = [...rcmTag.value.filter((item) => item !== tag), tag]
  uploadStore.VideoInfo.tags = rcmTag.value
}
const handleTagRemove = (tag: string) => {
  uploadStore.VideoInfo.tags = rcmTag.value.filter((item) => item !== tag)
}
const captureCover = async () => {
  if (!uploadStore.file) return

  // 创建视频元素
  const video = document.createElement('video')
  video.src = URL.createObjectURL(uploadStore.file)

  // 等待元数据加载
  video.onloadedmetadata = () => {
    // 跳转到第1秒处截取画面（可调整）
    video.currentTime = 1
    uploadStore.VideoInfo.duration = video.duration
  }

  // 监听时间跳转完成
  video.onseeked = () => {
    // 创建canvas绘制视频帧
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    // 转换为base64并存储
    uploadStore.coverUrlBase64 = canvas.toDataURL('image/jpeg')
    // 同时保存File对象和base64预览
    canvas.toBlob(
      (blob) => {
        if (!blob) return

        // 创建File对象（文件名用视频文件前缀）
        const coverFile = new File([blob], `${uploadStore.file?.name.split('.')[0]}_cover.jpg`, {
          type: 'image/jpeg',
        })
        console.log(coverFile)
        // 存储到store
        uploadStore.coverFile = coverFile // 新增coverFile字段
        // uploadStore.VideoInfo.coverUrlBase64 = URL.createObjectURL(coverFile) // 保持预览功能
      },
      'image/jpeg',
      0.8,
    )
    // 清理内存
    URL.revokeObjectURL(video.src)
  }
}
onMounted(() => {
  categoryStore.getCategory()
  userStore.getUserInfo()
})

watch(
  [
    () => uploadStore.file?.name,
    () => uploadStore.VideoInfo,
    () => uploadStore.file,
    () => {
      captureCover()
    },
  ],
  ([newFileName], [oldFileName]) => {
    // 文件名称变化时同步标题
    if (newFileName && newFileName !== oldFileName) {
      uploadStore.VideoInfo.title = newFileName
    }
  },
  { deep: true, immediate: true },
)
</script>

<style lang="less" scoped>
.content {
  margin: 0 auto;
  max-width: 1100px;
  min-width: 1000px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  height: 100%;

  .el-menu-demo {
    border-radius: 10px 10px 0 0;
  }
}

.video-basic {
  height: auto;

  .video-upload {
    .upload-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 70px;
      padding: 0 32px;
      font-size: 16px;
      font-weight: 600;
    }

    .file-item {
      display: flex;
      flex-direction: row;
      background: #f6f7f8;
      margin: 23px 32px 0;
      padding: 20px 12px;
      border-radius: 10px;

      .title {
        font-size: 14px;
      }

      .file-item-icon {
        display: flex;
        align-items: center;
        font-size: 45px;
        margin-right: 15px;
      }

      .file-item-content {
        .file-item-content-status-text {
          display: flex;
          align-items: center;
          margin-top: 5px;

          .success,
          .upload-progress {
            font-size: 10px;
            color: #999;
          }
        }
      }
    }
  }

  .form {
    padding: 20px 0 20px 30px;

    .title {
      margin-bottom: 20px;
    }

    .desc {
      margin-top: 20px;
    }

    .tag-wrp {
      padding-left: 127px;

      .recommend {
        font-size: 14px;
        color: rgb(96, 98, 102);
        cursor: default;
        margin-right: 10px;
      }
    }

    .submit {
      padding-left: 127px;
    }

    :deep(.el-cascader-panel) {
      width: 550px;
    }

    :deep(.el-form-item__label) {
      padding: 0 90px 0 0;
    }

    :deep(.el-input__inner) {
      height: 36px;
    }

    :deep(.el-tag.el-tag--primary.el-tag--light) {
      margin: 5px;
      cursor: pointer;
    }

    :deep(.el-input-tag.el-input-tag__wrapper) {
      height: 38px;
    }
  }
}
</style>
