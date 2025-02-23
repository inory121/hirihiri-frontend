<template>
  <div class="content" v-if="uploadStore.isShow">
    <!--    <div class="upload-nav">-->
    <!--      <router-link to="/platform/upload/video">-->
    <!--        <span class="upload-nav-item">视频投稿</span>-->
    <!--      </router-link>-->
    <!--      <span class="upload-nav-item">专栏投稿</span>-->
    <!--      <span class="upload-nav-item">音频投稿</span>-->
    <!--    </div>-->
    <el-menu default-active="0" class="el-menu-demo" mode="horizontal">
      <el-menu-item index="0">
        <router-link to="/platform/upload/video">
          <span class="upload-nav-item">视频投稿</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="1">
        <router-link to="/platform/upload/article">
          <span class="upload-nav-item">专栏投稿</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="2">
        <router-link to="/platform/upload/audio">
          <span class="upload-nav-item">音频投稿</span>
        </router-link>
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
    <el-button @click="uploadStore.confirmUpload()">确认投稿</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useUploadStore } from '@/stores/uploadStore.ts'

const uploadStore = useUploadStore()
</script>

<style lang="less" scoped>
.content {
  margin: 0 auto;
  max-width: 1100px;
  min-width: 1000px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);

  .el-menu-demo {
    border-radius: 10px 10px 0 0;
  }
}

.video-basic {
  height: 100%;

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
}
</style>
