<template>
  <!-- 头部频道 -->
  <div class="header-channel">
    <div class="channel-icons">
      <a href="#" class="channel-icons__item"
        ><img
          class="icon-img"
          src="https://i0.hdslb.com/bfs/baselabs/05b340832a490209f185542bb9690fc748bc08f7.png@38w_38h_1c"
          alt=""
        />
        <span>动态</span></a
      >
      <a href="#" class="channel-icons__item"
        ><img
          class="icon-img"
          src="https://i0.hdslb.com/bfs/baselabs/05b340832a490209f185542bb9690fc748bc08f7.png@38w_38h_1c"
          alt=""
        /><span>热门</span></a
      >
    </div>
    <div class="right-channel-container">
      <div class="channel-items__left">
        <MyPopover
          v-for="(mcName, index) in categoryStore.visibleItems"
          :key="index"
          class="channel-link"
          :placement="getPopoverPlacement(index)"
        >
          <template #reference>
            <a href="#">{{ mcName }}</a>
          </template>
          <template #content>
            <div class="popover-container">
              <div
                class="popover-item"
                v-for="(scNames, index) in categoryStore.scNames.get(mcName)"
                :key="index"
              >
                <a href="#" v-for="(scName, index) in scNames" :key="index">{{ scName }}</a>
              </div>
            </div>
          </template>
        </MyPopover>

        <a href="#" class="channel-link">VLOG</a>
        <a href="#" class="channel-link">更多</a>
      </div>
      <div class="channel-items__right">
        <a href="#" class="channel-link-right">
          <el-icon>
            <Document />
          </el-icon>
          <span>专栏</span>
        </a>
        <a href="#" class="channel-link-right">
          <el-icon>
            <VideoCameraFilled />
          </el-icon>
          <span>直播</span>
        </a>
        <a href="#" class="channel-link-right">
          <el-icon>
            <Flag />
          </el-icon>
          <span>活动</span>
        </a>
        <a href="#" class="channel-link-right">
          <el-icon>
            <CoffeeCup />
          </el-icon>
          <span>课堂</span>
        </a>
        <a href="#" class="channel-link-right">
          <el-icon>
            <ChatLineSquare />
          </el-icon>
          <span>社区中心</span>
        </a>
        <a href="#" class="channel-link-right">
          <el-icon>
            <Headset />
          </el-icon>
          <span>新歌热榜</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore.ts'
import MyPopover from '@/components/MyPopover/MyPopover.vue'

// 计算每个元素的 placement
const getPopoverPlacement = (index: number) => {
  return index % 2 === 0 ? 'top' : 'bottom'
}

const categoryStore = useCategoryStore()

const handleResize = () => {
  const width = window.innerWidth
  if (width <= 1366.9) {
    categoryStore.maxVisibleColumns = 8
  } else if (width > 1366.9 && width <= 1700.9) {
    categoryStore.maxVisibleColumns = 10
  } else if (width > 1700.9 && width <= 2199.9) {
    categoryStore.maxVisibleColumns = 11
  } else {
    categoryStore.maxVisibleColumns = 13
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化
  categoryStore.getCategory()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.popover-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px 16px;

  :last-child {
    margin-right: 0 !important;
  }

  .popover-item {
    display: flex;
    flex-direction: column;
    margin-right: 10px;

    a {
      color: #61666d;
      white-space: nowrap;
      height: 32px;
      line-height: 32px;
      letter-spacing: 0;
      padding: 0 6px;

      &:hover {
        background-color: #e3e5e7 !important;
        border-radius: 8px;
      }
    }
  }
}

// 频道
.header-channel {
  display: flex;
  max-width: calc(1980px + 2 * 60px);
  height: 100px;
  align-items: center;
  margin: 0 auto;

  // 左边两图标
  .channel-icons {
    display: flex;
    align-items: center;
    font-size: 13px;

    .channel-icons__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #000;

      .icon-img {
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-bottom: 6px;
      }
    }
  }

  // 右边频道
  .right-channel-container {
    display: flex;
    color: #000;
    width: 100%;
    align-items: center;

    .channel-items__left {
      width: 100%;
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(2, 1fr);
      grid-gap: 10px;
      justify-items: center;
      align-items: center;
      padding-right: 30px;
      border-right: 1px solid #e3e5e7;
      letter-spacing: 2px;

      .channel-link {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #61666d;
        background-color: #f6f7f8;
        border-radius: 6px;
        font-size: 13px;
        height: 30px;
        width: 100%;

        a {
          color: #61666d;
        }

        &:hover {
          background-color: #e3e5e7;
          transition:
            background-color,
            0.3s color,
            0.3s;

          a {
            color: #18191c;
          }
        }
      }
    }

    .channel-items__right {
      flex-shrink: 0;
      display: grid;
      grid-auto-flow: column;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-gap: 10px;
      justify-items: center;
      align-items: center;

      .channel-link-right {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #61666d;
        font-size: 14px;
        transition: color 0.2s linear;

        &:hover {
          color: #ff6699 !important;
        }
      }
    }
  }
}

@media (min-width: 1367px) {
  .icon-img {
    width: 46px !important;
    height: 46px !important;
  }
}

@media (max-width: 1366.9px) {
  .icon-img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 1366.9px) {
  .channel-icons {
    margin-right: 4px;
  }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {
  .channel-icons {
    margin-right: 8px;
  }
}

@media (min-width: 1701px) {
  .channel-icons {
    margin-right: 20px;
  }
}

@media (max-width: 1139.9px) {
  .header-channel {
    width: 1020px;
  }
}

@media (min-width: 1139.9px) {
  .header-channel {
    padding: 0 60px;
  }
}

@media (max-width: 1366.9px) {
  .header-channel {
    height: 100px;
  }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {
  .header-channel {
    height: 110px;
  }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {
  .header-channel {
    height: 120px;
  }
}

@media (min-width: 2200px) {
  .header-channel {
    height: 130px;
  }
}

@media (min-width: 1400px) {
  .header-channel {
    padding: 0 60px;
  }
}

@media (min-width: 1560px) {
  .header-channel {
    padding: 0 140px;
  }
}

@media (max-width: 1366.9px) {
  .channel-items__left {
    padding-right: 20px;
    grid-template-columns: repeat(9, 1fr);
  }
}

@media (min-width: 1367px) and (max-width: 1700.9px) {
  .channel-items__left {
    padding-right: 30px;
    grid-template-columns: repeat(11, 1fr);
  }
}

@media (min-width: 1701px) and (max-width: 2199.9px) {
  .channel-items__left {
    padding-right: 30px;
    grid-template-columns: repeat(12, 1fr);
  }
}

@media (min-width: 2200px) {
  .channel-items__left {
    padding-right: 30px;
    grid-template-columns: repeat(14, 1fr);
  }
}

@media (max-width: 1099.9px) {
  .channel-icons__item {
    margin-right: 10px;
  }
}

@media (min-width: 1100px) and (max-width: 1366.9px) {
  .channel-icons__item {
    margin-right: 16px;
  }
}

@media (min-width: 1367px) and (max-width: 2199.9px) {
  .channel-icons__item {
    margin-right: 24px;
  }
}

@media (min-width: 2200px) {
  .channel-icons__item {
    margin-right: 32px;
  }
}
</style>
