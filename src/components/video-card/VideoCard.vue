<template>
  <!-- 视频卡片 -->
  <!--  <div-->
  <!--    class="video-card-container"-->
  <!--    v-for="(item, index) in videoStore.videoList.length > 0-->
  <!--      ? videoStore.videoList-->
  <!--      : Array.from({ length: 21 }, () => ({}) as Video)"-->
  <!--    :key="index"-->
  <!--  >-->
  <div class="video-card-container" v-for="(item, index) in props.count" :key="index">
    <el-skeleton
      :loading="props.loading"
      animated
      :throttle="{ leading: 500, trailing: 500, initVal: true }"
    >
      <!-- 骨架屏内容 -->
      <template #template>
        <a href="#">
          <el-skeleton-item
            variant="image"
            style="padding-top: 55%; border-radius: 6px"
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
        <!-- 真实数据内容 -->
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
</template>

<script setup lang="ts">
const props = defineProps(['count', 'loading'])
</script>

<style scoped lang="less">
.video-card {
  width: 100%;

  .video-card-img {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    aspect-ratio: 16/9;
    object-fit: cover;
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
</style>
