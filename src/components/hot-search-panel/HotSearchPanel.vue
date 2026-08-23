<template>
  <div class="hot-search-panel">
    <div class="hot-search-panel__header">
      <span class="hot-search-panel__title">hirihiri热搜</span>
    </div>
    <div v-if="loading" class="hot-search-panel__loading">
      <div class="hot-search-panel__spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else-if="hotList.length === 0" class="hot-search-panel__empty">
      暂无热搜
    </div>
    <div v-else class="hot-search-panel__list">
      <div
        v-for="(item, index) in hotList"
        :key="item"
        class="hot-search-panel__item"
        @click="searchByKeyword(item)"
      >
        <span
          class="hot-search-panel__rank"
          :class="{ 'hot-search-panel__rank--top': index < 3 }"
        >{{ index + 1 }}</span>
        <span class="hot-search-panel__text" :title="item">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { get } from '@/utils/request'
import { VIDEO_API } from '@/api/video'

const props = withDefaults(
  defineProps<{
    limit?: number
  }>(),
  {
    limit: 10,
  },
)

const router = useRouter()
const loading = ref(false)
const hotList = ref<string[]>([])

const loadHotSearch = async () => {
  loading.value = true
  try {
    const res = await get<{ code: number; data: string[] }>(
      `${VIDEO_API.GET_HOT_SEARCH}?limit=${props.limit}`,
    )
    hotList.value = res.code === 200 ? res.data || [] : []
  } catch (e) {
    console.log('加载热搜失败:', e)
    hotList.value = []
  } finally {
    loading.value = false
  }
}

const searchByKeyword = (keyword: string) => {
  const { href } = router.resolve({ path: '/search/video', query: { keyword } })
  const a = document.createElement('a')
  a.href = href
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onMounted(() => {
  loadHotSearch()
})
</script>

<style lang="less" scoped>
.hot-search-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &__header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid #f1f2f3;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: @text-1;
  }

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 16px;
    font-size: 13px;
    color: @text-3;
  }

  &__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid @pink;
    border-radius: 50%;
    animation: hot-search-spin 1s linear infinite;
  }

  @keyframes hot-search-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  &__list {
    padding: 8px 0 12px;
  }

  &__item {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #f7f8fa;

      .hot-search-panel__text {
        color: @pink;
      }
    }
  }

  &__rank {
    width: 20px;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: @text-3;
    text-align: center;
    margin-right: 10px;

    &--top {
      color: @pink;
    }
  }

  &__text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: @text-1;
    .ellipsis();
  }
}
</style>
