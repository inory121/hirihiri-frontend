<template>
  <div class="account-home">
    <!-- 资料区 -->
    <div class="page-card profile-card">
      <a
        class="profile-avatar-link"
        :href="`/space/${user.uid}`"
        target="_blank"
        title="前往个人空间"
      >
        <img class="profile-avatar" :src="user.avatar || DEFAULT_AVATAR" alt="" />
      </a>
      <div class="profile-main">
        <div class="profile-name-line">
          <span class="profile-nickname">{{ getUserDisplayName(user) }}</span>
          <img class="profile-level-icon" :src="getLevelIconUrl(level)" :alt="`Lv${level}`" />
        </div>
        <div class="profile-exp-line">
          <div class="exp-bar">
            <div class="exp-bar-inner" :style="{ width: expPercent + '%' }">
              <span class="exp-lv-badge">LV{{ level }}</span>
            </div>
          </div>
          <span class="exp-text">{{ expText }}</span>
        </div>
        <div class="profile-coin-line">
          <span class="coin-item">
            <span class="coin-badge coin-badge--yellow">B</span>
            <span class="coin-num">{{ formatNumber(user.coin ?? 0) }}</span>
          </span>
          <span class="coin-item">
            <span class="coin-badge coin-badge--blue">H</span>
            <span class="coin-num">{{ formatNumber(H_COIN_PLACEHOLDER) }}</span>
          </span>
        </div>
      </div>
      <div class="profile-actions">
        <el-button @click="router.push('/account/setting')">修改资料</el-button>
      </div>
    </div>

    <!-- 每日奖励 -->
    <div class="page-card daily-card">
      <h3 class="daily-title">
        <el-icon class="daily-title-icon"><Money /></el-icon>
        <span>每日奖励</span>
      </h3>
      <div class="daily-list">
        <div v-for="task in dailyTasks" :key="task.key" class="daily-item">
          <div class="daily-circle" :class="task.done ? 'is-done' : 'is-todo'">
            <el-icon v-if="task.done" class="daily-check"><Check /></el-icon>
            <template v-else>
              <span class="daily-circle-num">{{ task.reward }}</span>
              <span class="daily-circle-exp">EXP</span>
            </template>
          </div>
          <div class="daily-name">{{ task.name }}</div>
          <div class="daily-state" :class="{ 'is-got': task.done }">{{ task.state }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Money, Check } from '@element-plus/icons-vue'
import { get } from '@/utils/request'
import { USER_API } from '@/api/user'
import { useUserStore } from '@/stores/userStore.ts'
import { DEFAULT_AVATAR } from '@/utils/constants'
import {
  getUserDisplayName,
  getLevelByExp,
  getLevelIconUrl,
  formatNumber,
} from '@/utils/utils.ts'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const exp = computed(() => user.value.exp ?? 0)
const level = computed(() => getLevelByExp(exp.value))

// H币暂无后端字段，与 HeaderBar 一致使用占位值
const H_COIN_PLACEHOLDER = 9999

// 与 getLevelByExp 阈值对应的各级下限/下一级门槛（Lv1 暂不启用，按 Lv0 处理）
const LEVEL_LOWER = [0, 0, 200, 1500, 4500, 10800, 28800]
const LEVEL_UPPER = [200, 200, 1500, 4500, 10800, 28800, Infinity]

const expPercent = computed(() => {
  const lower = LEVEL_LOWER[level.value]
  const upper = LEVEL_UPPER[level.value]
  if (!isFinite(upper)) return 100
  return Math.min(100, Math.max(0, ((exp.value - lower) / (upper - lower)) * 100))
})

const expText = computed(() => {
  const upper = LEVEL_UPPER[level.value]
  if (!isFinite(upper)) return `${exp.value} / MAX`
  return `${exp.value} / ${upper}`
})

// ======================== 每日奖励 ========================

const dailyExp = ref<Record<string, number>>({
  login: 0,
  watch: 0,
  vip_watch: 0,
  share: 0,
  coin: 0,
})

const dailyTasks = computed(() => {
  const d = dailyExp.value
  const watchGot = d.watch + d.vip_watch
  const coinDone = d.coin >= 50
  return [
    {
      key: 'login',
      name: '每日登录',
      reward: 5,
      done: d.login > 0,
      state: d.login > 0 ? `${d.login}经验值到手` : '未获得',
    },
    {
      key: 'watch',
      name: '每日观看视频',
      reward: d.vip_watch > 0 ? 10 : 5,
      done: watchGot > 0,
      state: watchGot > 0 ? `${watchGot}经验值到手` : '未获得',
    },
    {
      key: 'coin',
      name: '每日投币',
      reward: 50,
      done: coinDone,
      state: `${d.coin}/50经验值到手`,
    },
    {
      key: 'share',
      name: '每日分享视频',
      reward: 5,
      done: d.share > 0,
      state: d.share > 0 ? `${d.share}经验值到手` : '未获得',
    },
  ]
})

async function fetchDailyExp() {
  try {
    const res = await get<{ code: number; data: Record<string, number> }>(USER_API.USER_EXP_DAILY)
    if (res.code === 200 && res.data) {
      dailyExp.value = { ...dailyExp.value, ...res.data }
    }
  } catch (e) {
    console.log('加载每日奖励状态失败:', e)
  }
}

onMounted(() => {
  if (user.value.uid) {
    fetchDailyExp()
  } else {
    userStore.getUserInfo().then(() => fetchDailyExp())
  }
})
</script>

<style scoped lang="less">
.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;

  & + .page-card {
    margin-top: 16px;
  }
}

.profile-card {
  display: flex;
  align-items: flex-start;

  .profile-avatar-link {
    flex-shrink: 0;
    display: block;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;

    .profile-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover .profile-avatar {
      transform: scale(1.06);
    }
  }

  .profile-main {
    flex: 1;
    min-width: 0;
    padding-top: 2px;

    .profile-name-line {
      display: flex;
      align-items: center;
      gap: 10px;

      .profile-nickname {
        font-size: 18px;
        font-weight: 600;
        color: @text-1;
      }

      .profile-level-icon {
        width: 28px;
        height: 28px;
      }
    }

    .profile-exp-line {
      display: flex;
      align-items: center;
      margin-top: 12px;
      max-width: 370px;

      .exp-bar {
        flex: 1;
        position: relative;
        height: 22px;
        border-radius: 999px;
        background: #eff0f2;

        // 深橙色进度填充段（整条橙色区域），左侧被徽章覆盖
        .exp-bar-inner {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          // 进度过小时至少容纳一枚等级徽章，避免徽章溢出轨道
          min-width: 80px;
          border-radius: 999px;
          background: #fb8f45;
          transition: width 0.4s;
          display: flex;
          align-items: center;

          .exp-lv-badge {
            padding-left: 16px;
            font-size: 12px;
            font-weight: 700;
            line-height: 1;
            color: #fff;
          }
        }
      }

      .exp-text {
        flex-shrink: 0;
        margin-left: 12px;
        font-size: 12px;
        color: #61666d;
      }
    }

    .profile-coin-line {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-top: 14px;

      .coin-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .coin-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          color: #fff;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.coin-badge--yellow {
            background: #ffc800;
          }

          &.coin-badge--blue {
            background: #00a1d6;
          }
        }

        .coin-num {
          font-size: 14px;
          color: @text-1;
        }
      }
    }
  }

  .profile-actions {
    flex-shrink: 0;
    align-self: center;
  }
}

.daily-card {
  .daily-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0 24px;
    font-size: 17px;
    font-weight: 600;
    color: @text-1;

    .daily-title-icon {
      color: #4cbf6a;
      font-size: 22px;
    }
  }

  .daily-list {
    display: flex;

    .daily-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      & + .daily-item {
        border-left: 1px solid #f2f3f5;
      }

      .daily-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        &.is-done {
          background: #4cbf6a;
          color: #fff;

          .daily-check {
            font-size: 30px;
            font-weight: 700;
          }
        }

        &.is-todo {
          background: #23ade5;
          color: #fff;

          .daily-circle-num {
            font-size: 20px;
            font-weight: 700;
            line-height: 1;
          }

          .daily-circle-exp {
            font-size: 10px;
            font-weight: 600;
          }
        }
      }

      .daily-name {
        font-size: 14px;
        color: @text-1;
      }

      .daily-state {
        font-size: 12px;
        color: #9499a0;

        &.is-got {
          color: #fff;
          background: #b8c2cc;
          border-radius: 4px;
          padding: 3px 8px;
        }
      }
    }
  }
}
</style>
