<template>
  <div
    class="nav-searchform"
    :class="{ 'nav-searchform--focus': showSearchPanel }"
    ref="searchWrapRef"
  >
    <input
      v-model="input"
      class="nav-searchform__input"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="handleSearch"
      @focus="handleSearchFocus"
      @input="handleInput"
    />
    <button
      v-if="input"
      class="nav-searchform__clear"
      @click.stop="handleClear"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
    <button
      class="nav-searchform__btn"
      @click="handleSearch"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>
    <div v-if="showSearchPanel" class="search-panel">
      <div v-if="input.trim() && suggestList.length > 0" class="search-panel__section">
        <div
          v-for="(item, index) in suggestList"
          :key="index"
          class="suggest-item"
          @click="searchByKeyword(item)"
        >
          <span v-html="highlightKeyword(item, input.trim())"></span>
        </div>
      </div>
      <template v-else>
        <div v-if="searchHistory.length > 0" class="search-panel__section">
          <div class="search-panel__header">
            <span class="search-panel__title">搜索历史</span>
            <span class="search-panel__clear" @click="clearHistory">清空</span>
          </div>
          <div
            ref="searchHistoryListRef"
            class="search-history-list"
            :class="{ 'search-history-list--expanded': showAllHistory }"
          >
            <div
              v-for="(item, index) in searchHistory"
              :key="index"
              class="search-history-item"
              @click="searchByKeyword(item)"
            >
              <span
                class="search-history-item__text"
                :title="item"
              >{{ item }}</span>
              <span
                class="search-history-item__close"
                @click.stop="deleteHistoryItem(index)"
              >×</span>
            </div>
          </div>
          <div
            v-if="needsExpand"
            class="search-panel__expand"
            @click.stop="showAllHistory = !showAllHistory"
          >
            {{ showAllHistory ? '收起' : '展开更多' }}
            <i :class="showAllHistory ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </div>
        </div>
        <div v-if="hotSearchList.length > 0" class="search-panel__section">
          <div class="search-panel__header">
            <span class="search-panel__title">hirihiri热搜</span>
          </div>
          <div class="hot-search-list">
            <div
              v-for="(item, index) in hotSearchList"
              :key="index"
              class="hot-search-item"
              @click="searchByKeyword(item)"
            >
              <span
                class="hot-search-item__rank"
                :class="{ 'hot-search-item__rank--top': index < 3 }"
              >{{ index + 1 }}</span>
              <span class="hot-search-item__text" :title="item">{{ item }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, watch, defineProps } from 'vue'
import { useVideoStore } from '@/stores/videoStore.ts'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  placeholder?: string
  defaultValue?: string
}>()

const router = useRouter()
const videoStore = useVideoStore()
const { hotSearchList } = storeToRefs(videoStore)

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY_COUNT = 20

const input = ref(props.defaultValue || '')
const showSearchPanel = ref(false)
const showAllHistory = ref(false)
const searchHistory = ref<string[]>([])
const searchWrapRef = ref<HTMLElement | null>(null)
const searchHistoryListRef = ref<HTMLElement | null>(null)
const needsExpand = ref(false)
const suggestList = ref<string[]>([])
let suggestTimer: ReturnType<typeof setTimeout> | null = null

const COLLAPSED_MAX_HEIGHT = 80

const checkHistoryOverflow = () => {
  nextTick(() => {
    const el = searchHistoryListRef.value
    if (!el) {
      needsExpand.value = false
      return
    }
    needsExpand.value = el.scrollHeight > COLLAPSED_MAX_HEIGHT + 1
  })
}

const handleInput = () => {
  const keyword = input.value.trim()
  if (!keyword) {
    suggestList.value = []
    if (suggestTimer) {
      clearTimeout(suggestTimer)
      suggestTimer = null
    }
    return
  }
  if (suggestTimer) {
    clearTimeout(suggestTimer)
  }
  suggestTimer = setTimeout(async () => {
    const list = await videoStore.getSearchSuggest(keyword, 10)
    suggestList.value = list
  }, 300)
}

const highlightKeyword = (text: string, keyword: string): string => {
  if (!keyword) return text
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase())
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + keyword.length)
  const after = text.slice(idx + keyword.length)
  return `${before}<span class="suggest-item__highlight">${match}</span>${after}`
}

const loadHistory = () => {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (data) {
      searchHistory.value = JSON.parse(data)
    }
  } catch (e) {
    searchHistory.value = []
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (e) {
    console.error('保存搜索历史失败', e)
  }
}

const addHistory = (keyword: string) => {
  const trimmed = keyword.trim()
  if (!trimmed) return
  const idx = searchHistory.value.indexOf(trimmed)
  if (idx > -1) {
    searchHistory.value.splice(idx, 1)
  }
  searchHistory.value.unshift(trimmed)
  if (searchHistory.value.length > MAX_HISTORY_COUNT) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_COUNT)
  }
  saveHistory()
}

const deleteHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
  saveHistory()
}

const clearHistory = () => {
  searchHistory.value = []
  saveHistory()
}

const handleSearchFocus = () => {
  const wasHidden = !showSearchPanel.value
  showSearchPanel.value = true
  showAllHistory.value = false
  if (wasHidden) {
    nextTick(() => {
      videoStore.getHotSearchList(10)
      checkHistoryOverflow()
    })
  }
}

const handleClear = () => {
  input.value = ''
  suggestList.value = []
}

const handleClickOutside = (e: MouseEvent) => {
  if (searchWrapRef.value && !searchWrapRef.value.contains(e.target as Node)) {
    showSearchPanel.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    showSearchPanel.value = false
  }
}

const searchByKeyword = (keyword: string) => {
  input.value = keyword
  addHistory(keyword)
  showSearchPanel.value = false
  router.push({
    path: '/search/video',
    query: { keyword },
  })
}

const handleSearch = () => {
  const keyword = input.value.trim()
  if (!keyword) return
  addHistory(keyword)
  showSearchPanel.value = false
  router.push({
    path: '/search/video',
    query: {
      keyword: encodeURIComponent(keyword),
    },
  })
}

onMounted(() => {
  loadHistory()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

watch(searchHistory, () => {
  if (showSearchPanel.value) {
    checkHistoryOverflow()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  if (suggestTimer) {
    clearTimeout(suggestTimer)
    suggestTimer = null
  }
})
</script>

<style lang="less" scoped>
.nav-searchform {
  display: flex;
  height: inherit;
  min-width: 181px;
  max-width: inherit;
  width: 100%;
  position: relative;
  border-radius: inherit;
  border: 1px solid #e3e5e7;
  background: #f1f2f3;
  transition: all 0.3s ease;

  &--focus {
    background: #fff;
    border-color: #e3e5e7;
    border-radius: inherit;
  }

  &__input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 0 16px;
    font-size: 14px;
    color: #18191c;
    min-width: 0;

    &::placeholder {
      color: #9499a0;
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #c0c4cc;
    flex-shrink: 0;
    transition: color 0.2s;

    &:hover {
      color: #9499a0;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 100%;
    border: none;
    border-left: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    color: #9499a0;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
      color: #00aeec;
    }
  }

  &--focus &__btn {
    border-left-color: #e3e5e7;
    background: #fff;

    &:hover {
      background: #f1f2f3;
    }
  }

  .search-panel {
    padding: 13px 0 16px;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 9999;
    max-height: 480px;
    overflow-y: auto;

    &__section {
      margin-bottom: 0;
      padding: 0 16px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: #18191c;
    }

    &__clear {
      font-size: 12px;
      color: #9499a0;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #fb7299;
      }
    }

    &__expand {
      font-size: 12px;
      color: #9499a0;
      text-align: center;
      cursor: pointer;
      margin-top: 8px;
      margin-bottom: 15px;
      transition: color 0.2s;

      &:hover {
        color: #00aeec;
      }
    }
  }

  .suggest-item {
    height: 36px;
    padding: 0 16px;
    line-height: 36px;
    font-size: 14px;
    color: #18191c;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.2s;

    &:hover {
      background: #e9e9eb;
    }

    :deep(.suggest-item__highlight) {
      color: #fb7299;
      font-weight: 500;
    }
  }

  .search-history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 6px 0 6px;
    margin-bottom: 15px;
    max-height: 80px;
    overflow: hidden;
    transition: max-height 0.3s ease;

    &--expanded {
      max-height: 300px;
    }
  }

  .search-history-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 32px;
    padding: 0 12px;
    background: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 7px;
    font-size: 12px;
    color: #606266;
    cursor: pointer;
    box-sizing: border-box;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #d9ecff;
      color: #409eff;
    }

    .search-history-item__text {
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .search-history-item__close {
      position: absolute;
      top: -6px;
      right: -6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      font-size: 11px;
      line-height: 1;
      color: #fff;
      background: #c0c4cc;
      border: 1px solid #c0c4cc;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .search-history-item__close {
      opacity: 1;
    }
  }

  .hot-search-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 16px;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .hot-search-item {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #e9e9eb;
    }

    .hot-search-item__rank {
      width: 20px;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
      color: #9499a0;
      text-align: center;
      margin-right: 8px;

      &.hot-search-item__rank--top {
        color: #fb7299;
      }
    }

    .hot-search-item__text {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      color: #18191c;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
