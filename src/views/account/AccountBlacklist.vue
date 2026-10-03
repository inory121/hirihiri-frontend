<template>
  <div class="account-blacklist">
    <div class="page-card">
      <h2 class="page-title">黑名单管理</h2>
      <p class="page-desc">被拉黑的用户无法给你发私信，你也无法向其发送私信。</p>

      <div v-if="loading && list.length === 0" class="list-status">加载中...</div>
      <div v-else-if="list.length === 0" class="list-status">
        <el-empty description="黑名单为空" />
      </div>
      <template v-else>
        <div v-for="item in list" :key="item.uid" class="black-item">
          <a :href="`/space/${item.uid}`" target="_blank">
            <img class="black-avatar" :src="item.avatar || DEFAULT_AVATAR" alt="" />
          </a>
          <div class="black-info">
            <a :href="`/space/${item.uid}`" target="_blank" class="black-name">
              {{ getUserDisplayName(item) }}
            </a>
            <div class="black-meta">UID: {{ item.uid }}</div>
          </div>
          <el-button plain type="danger" :loading="removingUid === item.uid" @click="handleRemove(item)">
            移出黑名单
          </el-button>
        </div>
        <div v-if="hasMore" class="load-more">
          <el-button :loading="loading" @click="loadMore">加载更多</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { get, del } from '@/utils/request'
import { USER_API } from '@/api/user'
import type { User } from '@/types/api'
import { DEFAULT_AVATAR } from '@/utils/constants'
import { getUserDisplayName } from '@/utils/utils.ts'

const list = ref<User[]>([])
const loading = ref(false)
const removingUid = ref<number | null>(null)
const pageNum = ref(1)
const pageSize = 30
const hasMore = ref(false)

async function fetchList(append = false) {
  loading.value = true
  try {
    const res = await get<{ code: number; message: string; data: User[] }>(
      `${USER_API.USER_BLOCK_LIST}?pageNum=${pageNum.value}&pageSize=${pageSize}`,
    )
    if (res.code === 200) {
      const records = res.data || []
      list.value = append ? [...list.value, ...records] : records
      hasMore.value = records.length === pageSize
    } else if (!append) {
      list.value = []
    }
  } catch (e) {
    console.log('加载黑名单失败:', e)
    if (!append) list.value = []
  } finally {
    loading.value = false
  }
}

function loadMore() {
  pageNum.value += 1
  fetchList(true)
}

async function handleRemove(item: User) {
  try {
    await ElMessageBox.confirm(
      `确定将「${getUserDisplayName(item)}」移出黑名单吗？`,
      '移出黑名单',
      { confirmButtonText: '移出', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  removingUid.value = item.uid
  try {
    const res = await del<{ code: number; message: string }>(
      `${USER_API.USER_BLOCK}/${item.uid}`,
    )
    if (res.code === 200) {
      ElMessage.success(res.message || '已移出黑名单')
      list.value = list.value.filter((u) => u.uid !== item.uid)
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    console.log('移出黑名单失败:', e)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    removingUid.value = null
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="less">
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  .page-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: @text-1;
  }

  .page-desc {
    margin: 0 0 16px;
    font-size: 13px;
    color: #9499a0;
  }
}

.list-status {
  padding: 24px 0;
  text-align: center;
  font-size: 14px;
  color: #9499a0;
}

.black-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f2f3f5;

  &:last-of-type {
    border-bottom: none;
  }

  .black-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
  }

  .black-info {
    flex: 1;
    min-width: 0;

    .black-name {
      font-size: 15px;
      color: @text-1;

      &:hover {
        color: @blue;
      }
    }

    .black-meta {
      margin-top: 2px;
      font-size: 12px;
      color: #9499a0;
    }
  }
}

.load-more {
  margin-top: 16px;
  text-align: center;
}
</style>
