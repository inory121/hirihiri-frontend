<template>
  <div class="content" v-if="uploadStore.isShow">
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
            <div class="cover-slider-image-list">
              <div
                v-for="(frame, index) in videoFrames"
                :key="index"
                class="frame-thumbnail"
                @click="seekToFrame(frame.time)"
              >
                <img :src="frame.image" alt="视频帧" />
              </div>
              <div class="time-slider">
                <input
                  type="range"
                  v-model="currentTime"
                  :max="Math.ceil(videoDuration)"
                  @input="updateVideoFrame"
                  @change="updateVideoFrame.flush()"
                />
                <span class="current-time">{{ formatTime(currentTime) }}</span>
              </div>
            </div>
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
        <div class="cover-dialog-body" v-show="selectCoverCropperShow">
          <div class="cover-cropper">
            <div class="cover-cropper-left">
              <cropper
                @change="onSelectCoverChange"
                class="cropper"
                ref="selectCropperRef"
                :stencil-props="{
                  aspectRatio: 4 / 3,
                }"
                :debounce="false"
                :src="uploadStore.selectOriginalCover"
              />
              <span class="size"
                >已截取分辨率：{{ selectCropperResult.coordinates.width }}x{{
                  selectCropperResult.coordinates.height
                }}</span
              >
            </div>
            <div class="cover-cropper-right">
              <div class="cover-first">
                <span class="title">16:9封面</span>
                <preview
                  :width="160"
                  :height="90"
                  :image="selectCropperResult.image"
                  :coordinates="selectCropperResult.coordinates"
                />
              </div>
              <div class="cover-second">
                <span class="title">4:3封面</span>
                <preview
                  :width="160"
                  :height="120"
                  :image="selectCropperResult.image"
                  :coordinates="selectCropperResult.coordinates"
                />
              </div>
            </div>
          </div>
          <div class="btn-wrap">
            <el-button
              type="primary"
              @click="changeSelectCover"
              style="width: 128px; height: 40px; font-size: 16px; margin-top: 10px"
              >完成
            </el-button>
          </div>
        </div>

        <el-upload
          drag
          accept=".jpg, .jpeg, .png, .gif, .bmp, .webp"
          :before-upload="beforeCoverUpload"
          :on-change="handleFileChange"
          v-show="!selectCoverCropperShow"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          ref="uploadRef"
        >
          <template #trigger>
            <el-icon class="upload-icon" size="40">
              <Upload />
            </el-icon>
            <div class="upload-text">拖拽到此处也可上传</div>
            <el-button type="primary" class="upload-btn">上传图片</el-button>
          </template>
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
import { nextTick, reactive, ref, watch } from 'vue'
import { useUploadStore } from '@/stores/uploadStore.ts'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import { type CascaderValue, ElMessage, type FormRules, type UploadFile } from 'element-plus'
import { Cropper, Preview } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { debounce } from 'lodash-es'

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
const uploadRef = ref()
const videoFrames = ref<{ time: number; image: string }[]>([]) // 视频帧数组
const currentTime = ref(0) // 当前时间
const videoDuration = ref(0) // 视频时长
const coverDialogShow = ref(false) // 上传封面弹窗显示
const coverCropperShow = ref(true) // 自动封面裁剪显示
const selectCoverCropperShow = ref(false) // 手动选择封面裁剪显示
const cropperRef = ref<typeof Cropper>() // 封面裁剪组件实例
const selectCropperRef = ref<typeof Cropper>() // 封面裁剪组件实例
// 表单验证规则
const rules = reactive<FormRules<ruleForm>>({
  cover: [{ required: true, message: '请选择封面', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分区', trigger: 'blur' }],
  tags: [{ required: true, message: '请输入标签', trigger: 'blur' }],
})
const rcmTag = ref<string[]>([]) // 标签输入框的内容
// 标签展示区的内容
const rcmTags = ref<string[] | undefined>([
  '二次元',
  '孤独摇滚',
  'Cosplay',
  'MAD',
  '爱抖露',
  '爱莉希雅',
])
// 封面裁剪结果
const cropperResult = ref({
  coordinates: { width: 0, height: 0 },
  image: { src: '' },
})
// 手动选择封面裁剪结果
const selectCropperResult = ref({
  coordinates: { width: 0, height: 0 },
  image: { src: '' },
})
const COVER_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOW_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
}
const beforeCoverUpload = (file: File) => {
  // 类型校验
  if (!COVER_CONFIG.ALLOW_TYPES.includes(file.type)) {
    ElMessage.error('不支持的图片格式')
    return false
  }

  // 大小校验
  if (file.size > COVER_CONFIG.MAX_SIZE) {
    ElMessage.error(`图片大小不能超过${COVER_CONFIG.MAX_SIZE / 1024 / 1024}MB`)
    return false
  }

  // 预览图片
  // const reader = new FileReader()
  // reader.onload = (e) => {
  //   uploadStore.coverUrlBase64 = e.target?.result as string
  // }
  // reader.readAsDataURL(file)

  return true
}

const handleFileChange = (file: UploadFile) => {
  if (!file || !file.raw) {
    ElMessage.error('文件读取失败')
    return
  }
  const reader = new FileReader()

  // 当文件读取完成时触发
  reader.onload = (e) => {
    if (e.target && e.target.result) {
      const base64 = e.target.result as string // 获取到的Base64字符串
      uploadStore.selectOriginalCover = base64
      uploadStore.selectCoverUrlBase64 = uploadStore.selectOriginalCover
      // 如果需要显示预览，可以设置 file.url
      file.url = base64
    }
  }

  // 如果读取过程中出错
  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试')
  }

  // 开始读取文件并转换为Base64
  reader.readAsDataURL(file.raw!)
  selectCoverCropperShow.value = true

  // 清空已选文件（
  nextTick(() => {
    uploadRef.value?.clearFiles()
  })
}

// 生成视频缩略图
const generateVideoFrames = async () => {
  try {
    if (!uploadStore.file) return

    const video = document.createElement('video')
    video.src = URL.createObjectURL(uploadStore.file)
    video.muted = true
    video.setAttribute('crossOrigin', 'anonymous')
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = reject
      video.load()
    })
    videoDuration.value = video.duration

    // 设置时间偏移量（避开首尾2秒）
    const START_OFFSET = 2
    const END_OFFSET = 2
    const effectiveDuration = Math.max(0, videoDuration.value - START_OFFSET - END_OFFSET)
    // 生成7个等距时间点
    const timePoints = Array.from(
      { length: 7 },
      (_, i) => START_OFFSET + (effectiveDuration / 6) * i,
    )

    // 顺序生成帧（避免并行操作冲突）
    const frames = []
    for (const time of timePoints) {
      const image = await captureFrame(video, time)
      if (image) frames.push({ time, image })
    }
    videoFrames.value = frames
    URL.revokeObjectURL(video.src)
  } catch (error) {
    console.error('生成视频帧失败:', error)
  }
}

// 捕获单帧图像
const captureFrame = async (video: HTMLVideoElement, time: number) => {
  return new Promise<string>((resolve) => {
    video.onseeked = null
    video.currentTime = time
    video.onseeked = () => {
      // 添加视频尺寸验证
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('无效的视频尺寸')
        return resolve('')
      }
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg'))
    }
  })
}

// 更新时间显示和预览
const updateVideoFrame = debounce(() => {
  const video = document.createElement('video')
  video.src = URL.createObjectURL(uploadStore.file!)
  video.currentTime = currentTime.value

  video.onseeked = () => {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    uploadStore.originalCover = canvas.toDataURL('image/jpeg')
    URL.revokeObjectURL(video.src)
  }
}, 300)

// 格式化时间显示
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}

// 点击缩略图跳转
const seekToFrame = (time: number) => {
  currentTime.value = time
  updateVideoFrame()
}

const changeCover = () => {
  if (!cropperRef.value) return

  // 调用 cropper 组件实例上的 getResult 方法
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

const changeSelectCover = () => {
  if (!selectCropperRef.value) return

  // 调用 cropper 组件实例上的 getResult 方法
  const { canvas } = selectCropperRef.value.getResult()
  uploadStore.coverUrlBase64 = canvas.toDataURL()
  canvas.toBlob((blob: Blob) => {
    if (blob) {
      uploadStore.coverFile = new File([blob], `${uploadStore.file?.name}.jpg`, {
        type: 'image/jpeg',
      })
    }
  })
  coverDialogShow.value = false
  selectCoverCropperShow.value = false
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
  rcmTags.value = categoryStore.rcmTags(valueArr as [string, string])
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

const onSelectCoverChange = ({
  coordinates,
  image,
}: {
  coordinates: Coordinates
  image: CropperImage
}) => {
  selectCropperResult.value = { coordinates, image }
}

// 截取封面
const captureCover = async () => {
  if (!uploadStore.file) return

  // 创建视频元素
  const video = document.createElement('video')
  video.src = URL.createObjectURL(uploadStore.file)

  // 等待元数据加载
  video.onloadedmetadata = () => {
    // 跳转到第1秒处截取画面
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
        // 创建File对象（文件名用视频文件名前缀）,存储到store
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
// 移除文件扩展名
const removeFileExtension = (fileName: string): string => {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    parts.pop() // 移除最后一个部分（后缀）
  }
  return parts.join('.')
}

watch(
  [() => uploadStore.file?.name, () => uploadStore.file],
  async ([newFileName, newFile], [oldFileName, oldFile]) => {
    // 仅在文件变化时执行封面截取
    if (newFile !== oldFile) {
      await captureCover()
      await generateVideoFrames()
    }
    // 文件名称变化时同步标题
    if (newFileName && newFileName !== oldFileName) {
      rcmTag.value = []
      uploadStore.VideoInfo.title = removeFileExtension(newFileName)
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

      &-icon {
        display: flex;
        align-items: center;
        font-size: 45px;
        margin-right: 15px;
      }

      &-content {
        &-status-text {
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
    &-body {
      padding: 0 15px;

      .cover-cropper {
        display: flex;
        gap: 32px;

        &-left {
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

        &-right {
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

      .cover-slider {
        display: flex;
        align-items: center;
        margin-top: 30px;
        justify-content: center;

        &-image-list {
          display: flex;
          position: relative;
          height: 60px;
          width: 704px;
          background: #e7e7e7;
          align-items: center;
          border-radius: 8px;

          .frame-thumbnail {
            height: 100%;

            img {
              width: 100px;
              height: 100%;
              object-fit: cover;
            }

            .timestamp {
              position: absolute;
              bottom: 5px;
              left: 5px;
              background: rgba(0, 0, 0, 0.7);
              color: white;
              padding: 2px 5px;
              border-radius: 3px;
              font-size: 12px;
            }
          }
        }

        .time-slider {
          display: flex;
          flex-direction: column;
          position: absolute;
          width: 100%;

          input[type='range'] {
            appearance: none;
            background: transparent;
            outline: none;
            width: 100%;
            height: 10px;

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 12px;
              height: 64px;
              background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAACACAYAAAARQqnWAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAENSURBVHgB7drBTcMwFMbx7zkZoAgh4MYIlE0yAiN0EkZgA5oNGAFG6A0hQMm9GOOkl9aqlFppLu3/kxLJT8n7OfEpkU1dls2d/vyzTPdxNNPYBNVyxULVxcr65sG/HaXxblpZMXdx5k8TNFffM74V08t30HRpy7QSqkuNiS1/toczp4kDAAAAAAAAAAAAAABwRsDH51d/HFpPUw5d4L3PqqdhkQEAAAAAAAAAAAAAAAAAAM4KGPzbUhZFVj0buLm+yqqnYZEBAAAAAAAAAAAAAE4HGPyE2pecjdod0Gpr53iyb3p0XJzOuyZLqJ3c+lGbpzh2Gtnvwqm6XcnWc5nqA28MA0cTz6+x50PX+x/cNEgl6yvs0AAAAABJRU5ErkJggg==');
              background-size: cover;
              cursor: pointer;
            }
          }

          .current-time {
            background: rgba(47, 50, 56, 0.9);
            top: -58px;
            position: absolute;
            font-size: 12px;
            color: #fff;
            padding: 4px 8px;
            border-radius: 3px;
          }
        }
      }

      .btn-wrap {
        display: flex;
        justify-content: center;
      }
    }

    &-footer {
      text-align: center;
      margin-top: 20px;
    }
  }

  .upload-cover-dialog {
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
