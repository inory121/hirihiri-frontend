<template>
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
          <el-button @click="handleCancelUpload">取消发布</el-button>
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
    <el-dialog v-model="coverDialogShow" width="800" style="padding: 20px">
      <template #header>
        <el-menu mode="horizontal" default-active="1" @select="handleCoverDialogSelect">
          <el-menu-item index="1">截取封面</el-menu-item>
          <el-menu-item index="2">上传封面</el-menu-item>
        </el-menu>
      </template>
      <div class="cover-dialog" v-show="coverCropperShow">
        <div class="cover-dialog-body">
          <div class="cover-cropper">
            <div class="cover-cropper-left">
              <cropper
                class="cropper"
                @change="onCoverChange"
                :stencil-props="{
                  aspectRatio: 4 / 3,
                }"
                :debounce="false"
                :src="uploadStore.originalCover"
                ref="cropperRef"
              />
              <span class="size"
                >已截取分辨率：{{ cropperResult.coordinates.width }}x{{
                  cropperResult.coordinates.height
                }}</span
              >
            </div>
            <div class="cover-cropper-right">
              <div class="cover-first">
                <span class="title">16:9封面</span>
                <preview
                  :width="160"
                  :height="90"
                  :image="cropperResult.image"
                  :coordinates="cropperResult.coordinates"
                />
              </div>
              <div class="cover-second">
                <span class="title">4:3封面</span>
                <preview
                  :width="160"
                  :height="120"
                  :image="cropperResult.image"
                  :coordinates="cropperResult.coordinates"
                />
              </div>
            </div>
          </div>
          <div class="cover-slider">
            <div class="cover-slider-image-list"></div>
          </div>
        </div>
        <div class="cover-dialog-footer">
          <el-button
            type="primary"
            style="width: 128px; height: 40px; font-size: 16px"
            @click="changeCover"
            >完成
          </el-button>
        </div>
      </div>
      <div class="upload-cover-dialog" v-show="!coverCropperShow">
        <el-upload>
          <el-button type="primary">点击上传</el-button>
        </el-upload>
      </div>
    </el-dialog>
    <el-form
      class="form"
      :rules="rules"
      :model="uploadStore.VideoInfo"
      label-width="auto"
      style="width: 80%"
    >
      <div class="title">
        <span>基本设置</span>
      </div>
      <el-form-item label="封面" prop="cover">
        <el-image
          style="width: 192px; height: 108px; border-radius: 4px"
          fit="cover"
          :src="uploadStore.coverUrlBase64"
          :preview-src-list="[uploadStore.coverUrlBase64]"
          v-model="uploadStore.coverUrlBase64"
        >
        </el-image>
        <div class="cover-right">
          <el-button @click="coverDialogShow = !coverDialogShow">更换封面</el-button>
          <div class="cover-tip">系统默认截取视频第一秒作为封面</div>
        </div>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input v-model="uploadStore.VideoInfo.title" maxlength="80" :show-word-limit="true" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="uploadStore.VideoInfo.type">
          <el-radio :value="1">自制</el-radio>
          <el-radio :value="2">转载</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分区" prop="category">
        <el-cascader
          @change="handleCategoryChange"
          placeholder="请选择分区"
          :options="categoryStore.categories"
          filterable
        />
      </el-form-item>
      <!--标签输入框-->
      <el-form-item label="标签" prop="tags">
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
import { reactive, ref, watch } from 'vue'
import { useUploadStore } from '@/stores/uploadStore.ts'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import type { CascaderValue, FormRules } from 'element-plus'
import { Cropper, Preview } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface ruleForm {
  cover: string
  title: string
  type: number
  category: string
  tags: string
}

interface Coordinates {
  width: number
  height: number
}

interface CropperImage {
  src: string
}

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()

const coverDialogShow = ref(false) // 上传封面弹窗显示
const coverCropperShow = ref(true) // 封面裁剪显示
const cropperRef = ref<typeof Cropper>()
const rules = reactive<FormRules<ruleForm>>({
  cover: [{ required: true, message: '请选择封面', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分区', trigger: 'blur' }],
  tags: [{ required: true, message: '请输入标签', trigger: 'blur' }],
})
// 标签输入框的内容
const rcmTag = ref<string[]>([])
// 标签展示区的内容
const rcmTags = ref<string[] | undefined>([
  '二次元',
  '孤独摇滚',
  'Cosplay',
  'MAD',
  '爱抖露',
  '爱莉希雅',
])
const cropperResult = ref({
  coordinates: { width: 0, height: 0 },
  image: { src: '' },
})
const changeCover = () => {
  // 调用 cropper 组件实例上的 getResult 方法
  if (!cropperRef.value) {
    return
  }
  const { canvas } = cropperRef.value.getResult()
  uploadStore.coverUrlBase64 = canvas.toDataURL()
  canvas.toBlob((blob: Blob) => {
    if (blob) {
      uploadStore.coverFile = new File([blob], `${uploadStore.file?.name}.jpg`, {
        type: 'image/jpeg',
      })
    }
  })
  coverDialogShow.value = false
}
const handleCoverDialogSelect = (selected: string) => {
  if (selected === '1') {
    coverCropperShow.value = true
  } else if (selected === '2') {
    coverCropperShow.value = false
  }
}
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
const handleCancelUpload = () => {
  uploadStore.changeIsShow()
  rcmTag.value = []
}
const onCoverChange = ({
  coordinates,
  image,
}: {
  coordinates: Coordinates
  image: CropperImage
}) => {
  cropperResult.value = { coordinates, image }
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
    uploadStore.originalCover = canvas.toDataURL('image/jpeg')
    uploadStore.coverUrlBase64 = uploadStore.originalCover
    // 同时保存File对象和base64预览
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        // 创建File对象（文件名用视频文件前缀）,存储到store
        uploadStore.coverFile = new File([blob], `${uploadStore.file?.name}.jpg`, {
          type: 'image/jpeg',
        })
      },
      'image/jpeg',
      0.8,
    )
    // 清理内存
    URL.revokeObjectURL(video.src)
  }
}

watch(
  [() => uploadStore.file?.name, () => uploadStore.file],
  ([newFileName, newFile], [oldFileName, oldFile]) => {
    // 仅在文件变化时执行封面截取
    if (newFile !== oldFile) {
      captureCover()
    }
    // 文件名称变化时同步标题
    if (newFileName && newFileName !== oldFileName) {
      uploadStore.VideoInfo.title = removeFileExtension(newFileName)
    }
  },
  { deep: true, immediate: true },
)
const removeFileExtension = (fileName: string): string => {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    parts.pop() // 移除最后一个部分（后缀）
  }
  return parts.join('.')
}
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

  .cover-dialog {
    .cover-dialog-body {
      padding: 0 15px;

      .cover-cropper {
        display: flex;
        gap: 32px;

        .cover-cropper-left {
          .cropper {
            width: 530px;
            height: 265px;
            margin-bottom: 10px;
          }

          .size {
            font-size: 12px;
            color: #6a6a6a;
          }
        }

        .cover-cropper-right {
          .title {
            font-size: 12px;
            color: #18191c;
          }

          :deep(.vue-preview) {
            border-radius: 4px;
          }

          .cover-second {
            margin-top: 17px;
          }
        }
      }
    }

    .cover-dialog-footer {
      text-align: center;
      margin-top: 20px;
    }
  }

  .form {
    padding: 20px 0 20px 30px;

    .title {
      margin-bottom: 20px;
    }

    .cover-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-left: 30px;

      .cover-tip {
        margin-top: 10px;
        color: #9499a0;
        font-size: 12px;
      }
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
