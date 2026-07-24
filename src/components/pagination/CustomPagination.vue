<template>
  <div class="custom-pagination">
    <div class="pagination-left">
      <button
        class="page-btn prev-btn"
        :disabled="currentPage <= 1"
        @click="handlePrev"
      >
        上一页
      </button>
      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn page-number"
          :class="{ active: page === currentPage }"
          @click="handlePageChange(page as number)"
        >
          {{ page }}
        </button>
      </template>
      <button
        class="page-btn next-btn"
        :disabled="currentPage >= totalPages"
        @click="handleNext"
      >
        下一页
      </button>
    </div>
    <div class="pagination-right">
      <span class="page-info">共 {{ totalPages }} 页 / {{ formatTotal }} 个</span>
      <span class="jump-text">跳至</span>
      <input
        v-model="jumpPage"
        type="number"
        class="jump-input"
        min="1"
        :max="totalPages"
        @keyup.enter="handleJump"
      />
      <span class="jump-text">页</span>
      <button class="jump-btn" @click="handleJump">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  currentPage: number
  pageSize: number
  total: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'current-change', page: number): void
}>()

const jumpPage = ref(props.currentPage)

watch(() => props.currentPage, (newVal) => {
  jumpPage.value = newVal
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const formatTotal = computed(() => {
  const total = props.total
  if (total >= 10000) {
    return (total / 10000).toFixed(1) + '万'
  } else if (total >= 1000) {
    return (total / 1000).toFixed(1) + 'k'
  }
  return total.toString()
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.currentPage

  if (total <= 9) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current <= 4) {
      for (let i = 2; i <= 6; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push('...')
      for (let i = total - 5; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push('...')
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const handlePageChange = (page: number) => {
  emit('update:currentPage', page)
  emit('current-change', page)
}

const handlePrev = () => {
  if (props.currentPage > 1) {
    handlePageChange(props.currentPage - 1)
  }
}

const handleNext = () => {
  if (props.currentPage < totalPages.value) {
    handlePageChange(props.currentPage + 1)
  }
}

const handleJump = () => {
  let page = parseInt(jumpPage.value.toString()) || 1
  page = Math.max(1, Math.min(page, totalPages.value))
  jumpPage.value = page
  handlePageChange(page)
}
</script>

<style scoped lang="less">
.custom-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px 0;
  margin-top: 20px;

  .pagination-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .pagination-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #61666d;
  }

  .page-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #e3e5e7;
    border-radius: 4px;
    background: #fff;
    color: #18191c;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      border-color: #00aeec;
      color: #00aeec;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: #9499a0;
    }

    &.prev-btn {
      width: 72px;
      height: 32px;
    }

    &.next-btn {
      width: 72px;
    }

    &.page-number {
      &.active {
        background: #00aeec;
        border-color: #00aeec;
        color: #fff;

        &:hover {
          background: #0099d9;
          border-color: #0099d9;
        }
      }
    }
  }

  .page-ellipsis {
    color: #9499a0;
    font-size: 13px;
    margin: 0 2px;
  }

  .page-info {
    color: #9499a0;
  }

  .jump-text {
    color: #61666d;
  }

  .jump-input {
    width: 64px;
    height: 32px;
    border: 1px solid #e3e5e7;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 13px;
    text-align: center;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #00aeec;
    }
  }

  .jump-btn {
    width: 44px;
    height: 28px;
    border: 1px solid #e3e5e7;
    border-radius: 4px;
    background: #fff;
    color: #61666d;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #00aeec;
      color: #00aeec;
    }
  }
}
</style>
