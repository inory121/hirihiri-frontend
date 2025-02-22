<template>
  <!-- 主页主体 -->
  <div class="index">
    <header>
      <HeaderBar />
      <HeaderChannel />
    </header>
    <!-- 主体 -->
    <main>
      <!-- 推荐 -->
      <div class="recommended-container">
        <Carousel />
        <!-- 视频卡片 -->
        <div
          class="video-card-container"
          v-for="(item, index) in videoStore.videoList.length > 0
            ? videoStore.videoList
            : Array.from({ length: 11 }, () => ({}) as Video)"
          :key="index"
        >
          <el-skeleton
            :loading="loading"
            animated
            :throttle="{ leading: 500, trailing: 500, initVal: true }"
          >
            <template #template>
              <a href="#">
                <el-skeleton-item
                  variant="image"
                  style="padding-top: 50%; border-radius: 6px"
                ></el-skeleton-item>
              </a>
              <a href="#">
                <el-skeleton-item
                  variant="text"
                  style="height: 25px; margin-top: 10px"
                ></el-skeleton-item>
                <el-skeleton-item
                  variant="text"
                  style="height: 15px; margin-top: 10px; width: 40%"
                ></el-skeleton-item>
              </a>
            </template>
            <template #default>
              <div class="video-card">
                <div class="video-card__wrap">
                  <a href="#">
                    <div class="video-card__image">
                      <img :src="item.coverUrl" alt="" class="video-card-img" />
                    </div>
                  </a>
                  <div class="video-card__info">
                    <h3 class="video-card__info--title">
                      <a href="#">{{ item.title }}</a>
                    </h3>
                    <div class="video-card__info--bottom">
                      <a href="#">
                        up
                        <span>{{ item.uid }}</span
                        >&nbsp;
                        <span>{{ item.pubDate }}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </main>
  </div>
  <FileUpload />
</template>

<script lang="ts" setup>
import HeaderBar from '@/components/HeaderBar/HeaderBar.vue'
import HeaderChannel from '@/components/HeaderChannel/HeaderChannel.vue'
import Carousel from '@/components/Carousel/Carousel.vue'
import type { Video } from '@/stores/videoStore.ts'
import { useVideoStore } from '@/stores/videoStore.ts'
import { onMounted, ref } from 'vue'
import FileUpload from '@/components/FileUpload.vue'

const videoStore = useVideoStore()
const loading = ref(true)
onMounted(() => {
  videoStore
    .getRecommendVideo()
    .then(() => {
      loading.value = false
    })
    .catch(() => {
      loading.value = true
    })
})
</script>
<style scoped lang="less">
// 推荐
.recommended-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  margin: 0 auto;

  .video-card {
    width: 100%;

    .video-card-img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
    }

    .video-card__info {
      a {
        color: #000000;
        font-size: 15px;
        font-weight: 500;
        transition: color 0.2s linear;
        text-overflow: ellipsis;
        word-break: break-all;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-top: 7px;

        &:hover {
          color: #ff6699 !important;
        }
      }

      .video-card__info--bottom {
        a {
          font-size: 13px;
          color: #9499a0;
        }
      }

      .video-card__info--title {
        height: 44px;
      }
    }
  }
}

@media (min-width: 1400px) {
  .recommended-container {
    grid-template-columns: repeat(5, 1fr);
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px;
  }
}

@media (max-width: 1139.9px) {
  .recommended-container {
    width: 1020px;
  }
}

@media (min-width: 1139.9px) {
  .recommended-container {
    padding: 0 60px;
  }
}

@media (min-width: 1400px) {
  .recommended-container {
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .recommended-container {
    padding: 0 140px;
  }
}
</style>
