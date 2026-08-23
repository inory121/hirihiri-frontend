<template>
  <div class="dynamic-page">
    <div class="hiri-header__bar">
      <HeaderBar/>
    </div>

    <main class="dynamic-main">
      <div class="dynamic-layout">
        <!-- 左侧：用户信息 -->
        <aside class="dynamic-left">
          <div class="user-card">
            <template v-if="userStore.isLogin && userStore.user.uid">
              <a class="user-card__top" :href="`/space/${userStore.user.uid}`" target="_blank">
                <img class="user-card__avatar" :src="userStore.user.avatar || defaultAvatar"
                     alt=""/>
                <div class="user-card__info">
                  <div class="user-card__name">
                    {{ userStore.user.username }}
                  </div>
                  <div class="user-card__level">
                  <span v-if="userStore.user.vip === 1"
                        class="user-card__badge user-card__badge--vip1">月度大会员</span>
                    <span v-else-if="userStore.user.vip === 2"
                          class="user-card__badge user-card__badge--vip2">年度大会员</span>
                    <img
                      class="user-card__level-icon"
                      :src="getLevelIconUrl(getLevelByExp(userStore.user.exp))"
                      :alt="`Lv${getLevelByExp(userStore.user.exp)}`"
                    />
                  </div>
                </div>
              </a>
              <div class="user-card__stats">
                <a class="user-card__stat" :href="`/space/${userStore.user.uid}?tab=followings`"
                   target="_blank">
                  <span class="user-card__stat-num">{{
                      formatNumber(userStore.currentUserFollow.followings)
                    }}</span>
                  <span class="user-card__stat-label">关注</span>
                </a>
                <a class="user-card__stat" :href="`/space/${userStore.user.uid}?tab=followers`"
                   target="_blank">
                  <span class="user-card__stat-num">{{
                      formatNumber(userStore.currentUserFollow.followers)
                    }}</span>
                  <span class="user-card__stat-label">粉丝</span>
                </a>
                <div class="user-card__stat">
                  <span class="user-card__stat-num">{{
                      formatNumber(dynamicStore.myDynamicTotal)
                    }}</span>
                  <span class="user-card__stat-label">动态</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="user-card__guest">
                <div class="user-card__guest-title">登录后查看你的动态</div>
                <el-button type="primary" round @click="userStore.showLoginWindow = true">登录
                </el-button>
              </div>
            </template>
          </div>
        </aside>

        <!-- 中间：发动态 + 动态流 -->
        <div class="dynamic-center">
          <!-- 发动态 -->
          <div v-if="userStore.isLogin" class="dynamic-post">
            <!-- 标题 + 正文 整体输入区 -->
            <div class="dynamic-post__input-group"
                 :class="{ 'dynamic-post__input-group--active': isInputActive }">
              <!-- 标题输入 -->
              <el-input
                v-model="postTitle"
                maxlength="20"
                show-word-limit
                resize="none"
                clearable
                placeholder="好的标题更容易获得支持，选填20字"
                class="dynamic-post__title-input"
                @focus="isTitleFocused = true"
                @blur="isTitleFocused = false"
              >

              </el-input>
              <!-- 正文输入（MentionInput 支持 @） -->
              <div
                ref="postEditorRef"
                class="dynamic-post__editor"
                :class="{ 'dynamic-post__editor--active': isPostFocused }"
              >
                <MentionInput
                  ref="postMentionInput"
                  v-model="postContent"
                  :active="isPostFocused"
                  placeholder="有什么想和大家分享的？"
                  @at-trigger="onPostAtTrigger"
                  @focus="isPostFocused = true"
                  @blur="isPostFocused = false"
                />
                <!-- 清空正文 -->
                <span
                  v-if="postContent.length > 0"
                  class="dynamic-post__editor-clear"
                  title="清空"
                  @click="clearPostContent"
                >
              <el-icon><Close/></el-icon>
            </span>
                <!-- @候选面板 -->
                <div
                  v-if="showPostAtPanel"
                  class="dynamic-post__at-panel"
                  :style="postAtPanelStyle"
                  @mousedown.prevent
                >
                  <div class="dynamic-post__at-section-title">我的关注</div>
                  <div v-if="filteredPostFollowings.length === 0" class="dynamic-post__at-empty">
                    暂无关注
                  </div>
                  <div
                    v-for="u in filteredPostFollowings"
                    :key="u.uid"
                    class="dynamic-post__at-user"
                    @click="selectPostAtUser(u)"
                  >
                    <img :src="u.avatar || defaultAvatar" class="dynamic-post__at-avatar" alt=""/>
                    <div class="dynamic-post__at-info">
                      <span class="dynamic-post__at-name">{{ u.username }}</span>
                      <span class="dynamic-post__at-fans">{{ u.fanCount || 0 }}粉丝</span>
                    </div>
                  </div>
                  <div v-if="postAtSearchKeyword" class="dynamic-post__at-section-title">其他</div>
                  <div v-if="postAtSearchKeyword && postSearchUsers.length === 0"
                       class="dynamic-post__at-empty">未找到用户
                  </div>
                  <div
                    v-for="u in postSearchUsers"
                    :key="u.uid"
                    class="dynamic-post__at-user"
                    @click="selectPostAtUser(u)"
                  >
                    <img :src="u.avatar || defaultAvatar" class="dynamic-post__at-avatar" alt=""/>
                    <div class="dynamic-post__at-info">
                      <span class="dynamic-post__at-name">{{ u.username }}</span>
                      <span class="dynamic-post__at-fans">{{ u.fanCount || 0 }}粉丝</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 工具栏 -->
            <div class="dynamic-post__footer">
              <div class="dynamic-post__actions">
              <span class="dynamic-post__action" title="@用户" @click="onPostAtButtonClick">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                </svg>

              </span>
              </div>
              <div class="dynamic-post__submit">
                <span class="dynamic-post__count">{{ postContent.length }}</span>
                <el-button
                  type="primary"
                  round
                  :loading="dynamicStore.publishLoading"
                  :disabled="!canPublish"
                  @click="handlePublish"
                >发布
                </el-button>
              </div>
            </div>
          </div>

          <!-- UP主头像区（左右按钮平滑滚动，不切换数据页） -->
          <div v-if="userStore.isLogin" class="dynamic-ups">
            <div v-if="dynamicStore.upLoading && dynamicStore.upList.length === 0"
                 class="dynamic-ups__loading">
              加载中...
            </div>
            <div v-else-if="dynamicStore.upList.length === 0" class="dynamic-ups__empty">
              还没有UP主发过动态
            </div>
            <div v-else class="dynamic-ups__body">
              <button
                class="dynamic-ups__arrow dynamic-ups__arrow--left"
                :disabled="upsAtLeft"
                @click="scrollUps(-1)"
              >
                <el-icon>
                  <ArrowLeft/>
                </el-icon>
              </button>
              <div ref="upsScrollerRef" class="dynamic-ups__scroller" @scroll="onUpsScroll">
                <div class="dynamic-ups__list">
                  <div
                    class="dynamic-ups__item"
                    :class="{ 'dynamic-ups__item--active': filteredUid === null }"
                    @click="filterByUid(null)"
                  >
                    <img
                      class="dynamic-ups__avatar dynamic-ups__avatar--all"
                      src="https://hirihiri2.oss-cn-shanghai.aliyuncs.com/all-icon.png"
                      alt=""
                    />
                    <span class="dynamic-ups__name">全部动态</span>
                  </div>
                  <div
                    v-for="up in dynamicStore.upList"
                    :key="up.uid"
                    class="dynamic-ups__item"
                    :class="{ 'dynamic-ups__item--active': filteredUid === up.uid }"
                    @click="filterByUid(up.uid)"
                  >
                    <img class="dynamic-ups__avatar" :src="up.user?.avatar || defaultAvatar"
                         alt=""/>
                    <span class="dynamic-ups__name">{{
                        up.user?.username || up.user?.nickname || `UID:${up.uid}`
                      }}</span>
                  </div>
                  <!-- 末尾加载指示 -->
                  <div
                    v-if="upLoadingMore || !upHasMore"
                    class="dynamic-ups__item dynamic-ups__item--hint"
                  >
                    <span v-if="upLoadingMore" class="dynamic-ups__hint-loading">加载中…</span>
                    <span v-else-if="!upHasMore && dynamicStore.upList.length > 0"
                          class="dynamic-ups__hint-end">已显示全部</span>
                  </div>
                </div>
              </div>
              <button
                class="dynamic-ups__arrow dynamic-ups__arrow--right"
                :disabled="upsAtRight || upLoadingMore"
                @click="scrollUps(1)"
              >
                <el-icon>
                  <ArrowRight/>
                </el-icon>
              </button>
            </div>
          </div>

          <!-- 全部 / 视频投稿 -->
          <div v-if="userStore.isLogin" class="dynamic-tabs">
          <span
            class="dynamic-tabs__item"
            :class="{ 'dynamic-tabs__item--active': activeType === 0 }"
            @click="switchType(0)"
          >全部</span>
            <span
              class="dynamic-tabs__item"
              :class="{ 'dynamic-tabs__item--active': activeType === 2 }"
              @click="switchType(2)"
            >视频投稿</span>
          </div>

          <!-- 动态流 -->
          <div class="dynamic-feed">
            <template v-if="dynamicStore.dynamicLoading && dynamicStore.dynamicList.length === 0">
              <el-skeleton :rows="6" animated/>
            </template>
            <template v-else-if="dynamicStore.dynamicList.length === 0">
              <el-empty description="还没有动态，快来发第一条吧" :image-size="100"/>
            </template>
            <template v-else>
              <DynamicCard
                v-for="item in dynamicStore.dynamicList"
                :key="item.id"
                :item="item"
                @refresh="resetList"
              />
            </template>
            <!-- 懒加载：加载中 / 没有更多 -->
            <div v-if="dynamicStore.dynamicList.length > 0" class="dynamic-feed__more">
              <span v-if="loadingMore" class="dynamic-feed__more-tip">
                <el-icon class="is-loading"><Loading/></el-icon>
                加载中…
              </span>
              <span v-else-if="!hasMore" class="dynamic-feed__more-tip">没有更多动态了</span>
            </div>
          </div>
        </div>

        <!-- 右侧：热搜 -->
        <aside v-if="userStore.isLogin" class="dynamic-right">
          <HotSearchPanel :limit="10"/>
        </aside>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import HeaderBar from '@/components/header-bar/HeaderBar.vue'
import HotSearchPanel from '@/components/hot-search-panel/HotSearchPanel.vue'
import MentionInput from '@/components/mention-input/MentionInput.vue'
import DynamicCard from '@/components/dynamic-card/DynamicCard.vue'
import {useUserStore} from '@/stores/userStore'
import {useDynamicStore} from '@/stores/dynamicStore'
import {
  formatNumber,
  getLevelByExp,
  getLevelIconUrl,
} from '@/utils/utils.ts'
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Loading,
} from '@element-plus/icons-vue'
import type {Dynamic, User} from '@/types/api'

const defaultAvatar = 'https://hirihiri2.oss-cn-shanghai.aliyuncs.com/up_pb.svg'

const userStore = useUserStore()
const dynamicStore = useDynamicStore()

const pageNum = ref(1)
const pageSize = ref(10)
const activeType = ref<0 | 2>(0) // 0 全部 2 视频投稿
const filteredUid = ref<number | null>(null) // null=全部动态
const postContent = ref('')
const postTitle = ref('')


// UP主横向滚动容器
const upsScrollerRef = ref<HTMLElement | null>(null)
const upsAtLeft = ref(true)  // 已到最左（左按钮禁用）
const upsAtRight = ref(false) // 已到最右（右按钮禁用，或"还有更多"但正在加载时也暂禁用）
// UP主分页/加载更多（滚动到右端自动加载下一页，append 到 upList）
const upCurrentPage = ref(1)
const UP_PAGE_SIZE = 50
const upHasMore = ref(true)
const upLoadingMore = ref(false)
const UPS_LOAD_MORE_THRESHOLD = 80 // 距右端像素阈值，小于等于开始加载下一页

// 同步滚动两端状态
const updateUpsEdgeState = () => {
  const el = upsScrollerRef.value
  if (!el) {
    upsAtLeft.value = true
    upsAtRight.value = true
    return
  }
  const {scrollLeft, scrollWidth, clientWidth} = el
  // 留 1px 容差避免舍入误差
  upsAtLeft.value = scrollLeft <= 1
  // 视觉上已到最右（scroll到底 或 内容比容器小 + 没更多可以加载了）
  const atEdge = scrollLeft + clientWidth >= scrollWidth - 1
  upsAtRight.value = atEdge && !upHasMore.value
}

// 监听容器滚动：同步两端 + 接近右端自动加载更多
const onUpsScroll = () => {
  updateUpsEdgeState()
  tryLoadMoreUps()
}

// 滚动到接近右端时，加载下一页UP主（追加模式）
const tryLoadMoreUps = async () => {
  const el = upsScrollerRef.value
  if (!el) return
  if (upLoadingMore.value || !upHasMore.value) return
  const remain = el.scrollWidth - (el.scrollLeft + el.clientWidth)
  if (remain <= UPS_LOAD_MORE_THRESHOLD) {
    upLoadingMore.value = true
    try {
      const nextPage = upCurrentPage.value + 1
      const prevLen = dynamicStore.upList.length
      await dynamicStore.getUpList(nextPage, UP_PAGE_SIZE, true)
      const newLen = dynamicStore.upList.length
      upCurrentPage.value = nextPage
      // 取到的数据条数 < 每页大小 = 最后一页了
      if (newLen - prevLen < UP_PAGE_SIZE || newLen >= dynamicStore.upTotal) {
        upHasMore.value = false
      }
      // 列表高度变化后再同步一次两端
      nextTick(updateUpsEdgeState)
    } catch (e) {
      console.log('加载更多UP主失败:', e)
    } finally {
      upLoadingMore.value = false
    }
  }
}

// 点击左右箭头：按容器可见宽度的 90% 平滑滚动（≈"下一页"）
const scrollUps = (direction: -1 | 1) => {
  const el = upsScrollerRef.value
  if (!el) return
  const step = Math.max(Math.floor(el.clientWidth * 0.9), 200)
  el.scrollBy({left: direction * step, behavior: 'smooth'})
}

// 数据加载或窗口大小变化后，更新两端状态
watch(
  () => dynamicStore.upList.length,
  () => {
    nextTick(updateUpsEdgeState)
  },
)
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateUpsEdgeState)
  window.removeEventListener('scroll', onWindowScroll)
})

// ======================== 发动态 @ 功能 ========================
const postMentionInput = ref<InstanceType<typeof MentionInput> | null>(null)
const postEditorRef = ref<HTMLDivElement | null>(null) // 正文编辑器外层容器（面板相对它 absolute 定位）
const isTitleFocused = ref(false) // 标题焦点
const isPostFocused = ref(false) // 正文焦点（@功能仅正文可用）
// 标题或正文任一焦点时整个输入框高亮
const isInputActive = computed(() => isTitleFocused.value || isPostFocused.value)
const showPostAtPanel = ref(false)
// 面板在 __editor 容器里的像素偏移（光标定位模式），null 时回退到 CSS 底部定位
const postAtPanelPos = ref<{ top: number; left: number } | null>(null)
const postFollowings = ref<User[]>([])
const postAtSearchKeyword = ref('')
const postSearchUsers = ref<User[]>([])
let postAtSearchTimer: ReturnType<typeof setTimeout> | null = null

const canPublish = computed(() => {
  if (!userStore.isLogin) return false
  // 必须填正文才能发布（标题是选填，不影响按钮状态）
  return postContent.value.trim().length > 0
})

// @ 候选面板动态样式：如果有光标坐标则相对编辑器定位到光标右下角，否则回退 CSS 默认
const PANEL_WIDTH = 280
const PANEL_GAP = 4
const postAtPanelStyle = computed((): Record<string, string> | undefined => {
  const pos = postAtPanelPos.value
  if (!pos) return undefined
  return {
    top: `${pos.top}px`,
    left: `${pos.left}px`,
    bottom: 'auto',
    right: 'auto',
  }
})

// 首次打开面板时加载关注列表
const ensurePostFollowings = async () => {
  if (postFollowings.value.length === 0 && userStore.isLogin && userStore.user.uid) {
    await userStore.getFollowings(userStore.user.uid)
    postFollowings.value = [...userStore.followList]
  }
}

// MentionInput 检测到 @ 及其后的搜索关键词时触发
const onPostAtTrigger = async (keyword: string | null, rect: DOMRect | null = null) => {
  if (postAtSearchTimer) {
    clearTimeout(postAtSearchTimer)
    postAtSearchTimer = null
  }

  if (keyword === null) {
    showPostAtPanel.value = false
    postAtPanelPos.value = null
    postAtSearchKeyword.value = ''
    postSearchUsers.value = []
    return
  }

  // 计算面板在 __editor（position:relative）里的相对坐标，放在光标右下角
  const editor = postEditorRef.value
  if (editor && rect) {
    const er = editor.getBoundingClientRect()
    // 光标相对编辑器容器左上角的坐标
    let left = rect.left - er.left + PANEL_GAP
    let top = rect.bottom - er.top + PANEL_GAP
    // 右边界修正：面板整体不要超过编辑器宽度 + 外层右侧边距
    const maxLeft = Math.max(0, er.width - PANEL_WIDTH - 12)
    if (left > maxLeft) left = maxLeft
    if (left < 0) left = 0
    // 下边界修正：如果面板高度（预估 260）会超出视口底部 → 翻到光标上方
    const panelEstHeight = 260
    if (window.innerHeight - rect.bottom - PANEL_GAP < panelEstHeight) {
      top = rect.top - er.top - panelEstHeight - PANEL_GAP
      if (top < 0) top = rect.bottom - er.top + PANEL_GAP // 上方也不够就回退到底下
    }
    postAtPanelPos.value = {top, left}
  } else {
    postAtPanelPos.value = null // 无坐标回退到底部样式
  }

  showPostAtPanel.value = true
  postAtSearchKeyword.value = keyword
  await ensurePostFollowings()

  const searchKeyword = keyword.trim()
  if (!searchKeyword) {
    postSearchUsers.value = []
    return
  }

  postAtSearchTimer = setTimeout(async () => {
    await userStore.getSearchUsers(searchKeyword, 'default', 1, 10)
    if (postAtSearchKeyword.value === searchKeyword && showPostAtPanel.value) {
      postSearchUsers.value = [...userStore.searchUserList]
    }
  }, 300)
}

// 点击 @ 按钮：在 MentionInput 中插入 @ 字符并弹出面板
const onPostAtButtonClick = async () => {
  showPostAtPanel.value = true
  await ensurePostFollowings()
  await nextTick()
  const editor = postMentionInput.value?.$el?.querySelector('.mention-editor') as HTMLElement | null
  if (editor) {
    editor.focus()
    document.execCommand('insertText', false, '@')
  }
}

// 过滤后的关注列表（按搜索关键词）
const filteredPostFollowings = computed(() => {
  if (!postAtSearchKeyword.value) return postFollowings.value
  const kw = postAtSearchKeyword.value.toLowerCase()
  return postFollowings.value.filter(u => u.username?.toLowerCase().includes(kw))
})

// 选中一个用户：通过 MentionInput 插入 @username mention
const selectPostAtUser = (u: User) => {
  postMentionInput.value?.insertMention(u.username!, u.uid!)
  showPostAtPanel.value = false
  postAtSearchKeyword.value = ''
  postSearchUsers.value = []
}

const clearPostContent = () => {
  postContent.value = ''
  postMentionInput.value?.clear()
  showPostAtPanel.value = false
}

// 递归收集动态（含转发链）中出现的所有 user
const collectDynamicUsers = (item: Dynamic | null | undefined, acc: User[] = []): User[] => {
  if (!item) return acc
  if (item.user) acc.push(item.user)
  if (item.parent) collectDynamicUsers(item.parent, acc)
  return acc
}

// 动态流：懒加载（滚动到底部加载下一页，追加到 dynamicList）
const hasMore = ref(true)
const loadingMore = ref(false)
const LOAD_MORE_THRESHOLD = 300 // 距底部像素阈值，小于等于开始加载下一页

const loadList = async (page: number, append: boolean) => {
  await dynamicStore.getDynamicList(
    page,
    pageSize.value,
    activeType.value,
    filteredUid.value === null ? undefined : filteredUid.value,
    append,
  )
  // 把动态里所有作者（含转发链）的 isFollowing 同步到 followStatusMap
  const users: User[] = []
  for (const item of dynamicStore.dynamicList) {
    collectDynamicUsers(item, users)
  }
  userStore.syncFollowStatusFromList(users)
}

// 重置到第一页（切换类型 / 过滤 / 发布 / 删除后刷新）
const resetList = async () => {
  pageNum.value = 1
  hasMore.value = true
  loadingMore.value = false
  await loadList(1, false)
}

// 滚动加载下一页（追加模式）
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  if (dynamicStore.dynamicList.length === 0) return
  const next = pageNum.value + 1
  loadingMore.value = true
  const prevLen = dynamicStore.dynamicList.length
  await loadList(next, true)
  if (dynamicStore.dynamicList.length === prevLen
      || dynamicStore.dynamicList.length >= dynamicStore.dynamicTotal) {
    hasMore.value = false
  } else {
    pageNum.value = next
  }
  loadingMore.value = false
}

const onWindowScroll = () => {
  const remain = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  if (remain <= LOAD_MORE_THRESHOLD) {
    loadMore()
  }
}

const switchType = (type: 0 | 2) => {
  if (activeType.value === type) return
  activeType.value = type
  resetList()
}

const filterByUid = (uid: number | null) => {
  filteredUid.value = uid
  resetList()
}

// 获取发过动态的UP主列表：pageNum=1 时覆盖（重置分页和 hasMore）
const loadUpList = async () => {
  upCurrentPage.value = 1
  upHasMore.value = true
  upLoadingMore.value = false
  await dynamicStore.getUpList(1, UP_PAGE_SIZE, false)
  await nextTick()
  updateUpsEdgeState()
  // 首屏即不够一页就判断是否 hasMore=false
  if (dynamicStore.upList.length < UP_PAGE_SIZE || dynamicStore.upList.length >= dynamicStore.upTotal) {
    upHasMore.value = false
    updateUpsEdgeState()
  }
  // 首屏如果还"接近右端"（数据还不够放满容器），自动补下一页
  tryLoadMoreUps()
}

const handlePublish = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const content = postContent.value.trim()
  const title = postTitle.value.trim()
  const success = await dynamicStore.publishDynamic({
    title,
    content,
    type: 0,
    vid: null,
    images: [],
  })
  if (success) {
    postContent.value = ''
    postTitle.value = ''
    postMentionInput.value?.clear()
    showPostAtPanel.value = false
    await resetList()
    // 刷新信息卡"动态"统计（当前用户自己发布的动态总数）
    dynamicStore.getMyDynamicCount(userStore.user.uid)
  }
}


onMounted(async () => {
  loadList(1, false)
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  if (userStore.isLogin) {
    // 确保当前用户信息（含 uid）已加载，否则可能 user.user.uid 为空
    if (!userStore.user.uid) {
      await userStore.getUserInfo()
    }
    loadUpList()
    // 信息卡"动态"统计 = 当前用户自己发布的动态总数（区别于全站总数）
    if (userStore.user.uid) {
      dynamicStore.getMyDynamicCount(userStore.user.uid)
    }
  }
  nextTick(updateUpsEdgeState)
  window.addEventListener('resize', updateUpsEdgeState)
})
</script>

<style lang="less" scoped>
.hiri-header__bar {
  --search-display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.dynamic-page {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(ellipse at 12% 100%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 40%),
  radial-gradient(ellipse at 92% 6%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 35%),
  radial-gradient(ellipse at 50% 120%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 50%),
  linear-gradient(165deg, #e6f5f6 0%, #d6eef1 45%, #c4e4e9 100%);
}

.dynamic-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 88px 20px 48px;
  position: relative;
}

.dynamic-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.dynamic-left {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
}

.dynamic-center {
  flex: 1;
  min-width: 556px;
}

.dynamic-right {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
}

/* 注意：min-width 大的媒体查询必须写在后面，否则会被前面的规则覆盖 */
@media screen and (min-width: 1140px) {
  .dynamic-center {
    flex: none;
    width: 556px;
  }

  .dynamic-left {
    width: 194px;
  }

  .dynamic-right {
    width: 246px;
  }

  .dynamic-item__body {
    width: 452px;
  }
}

@media screen and (min-width: 1320px) {
  .dynamic-center {
    flex: none;
    width: 724px;
  }

  .dynamic-left {
    width: 264px;
  }

  .dynamic-right {
    width: 318px;
  }

  .dynamic-item__body {
    width: 616px;
  }
}

/* 用户信息卡 */
.user-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  padding: 20px 16px;

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__info {
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: @text-1;
    .ellipsis();
  }

  &__level {
    display: flex;
    align-items: center;
  }

  &__badge {
    display: inline-block;
    font-size: 11px;
    line-height: 16px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: normal;
    flex-shrink: 0;
    transform: scale(0.85);
    transform-origin: left center;

    &--vip1 {
      background: linear-gradient(135deg, #ffb74d, #fb8c00);
      color: #fff;
    }

    &--vip2 {
      background: linear-gradient(135deg, #ce93d8, #7b1fa2);
      color: #fff;
    }
  }

  &__level-icon {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
  }

  &__stats {
    display: flex;
    border-top: 1px solid #f1f2f3;
    margin-top: 16px;
    padding-top: 16px;
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;

    &:hover {
      .user-card__stat-num,
      .user-card__stat-label {
        color: @pink;
      }
    }
  }

  &__stat-num {
    font-size: 16px;
    font-weight: 600;
    color: @text-1;
  }

  &__stat-label {
    font-size: 12px;
    color: @text-3;
  }

  &__guest {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 0 8px;
  }

  &__guest-title {
    font-size: 13px;
    color: @text-3;
  }
}

/* 发动态 */
.dynamic-post {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  padding: 16px;
  margin-bottom: 12px;

  &__input-group {
    border: 1px solid #e1e2e3;
    border-radius: 8px;
    // 不能用 overflow:hidden：会裁剪掉弹出的 @ 候选面板（面板 absolute 定位在编辑器下方）
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: #c9cbcd;
    }

    &--active {
      border-color: @pink;
      box-shadow: 0 0 0 1px @pink;
    }
  }

  &__title-input {
    :deep(.el-input__wrapper) {
      border-radius: 8px 8px 0 0;
      padding-left: 0;
      background: transparent;
      box-shadow: none;
    }

    :deep(.el-input__prefix) {
      color: @text-3;
      padding-right: 6px;
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      padding-left: 11px;
    }
  }

  &__hash {
    font-size: 16px;
  }

  &__editor {
    position: relative;
    border-top: 1px solid #f1f2f3;

    &-clear {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 5;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }

    :deep(.mention-editor) {
      min-height: 90px;
      background: transparent;
      border-color: transparent;
      box-shadow: none;
      // 与默认 line-height: 34px 一致，caret 与 placeholder 在同一行

      &:hover,
      &.focused,
      &.active {
        background-color: transparent;
        border-color: transparent;
        box-shadow: none;
      }

      &.focused {
        border-color: transparent;
        box-shadow: none;
      }

      // 空内容时 placeholder 与 caret 同一行（顶部对齐第一行）
      &.is-empty::before {
        top: 8px;
        bottom: auto;
        height: 34px;
        line-height: 34px;
        left: 11px;
        right: 11px;
        display: flex;
        align-items: center;
      }
    }
  }

  &__at-panel {
    position: absolute;
    top: calc(100% + 6px);
    bottom: auto;
    left: 0;
    right: auto;
    width: 280px;
    max-width: calc(100% - 24px);
    z-index: 100;
    max-height: 260px;
    overflow-y: auto;
    padding: 6px 0;
    background: #fff;
    border: 1px solid #e5e6e7;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  &__at-section-title {
    padding: 6px 12px;
    font-size: 12px;
    color: @text-3;
  }

  &__at-empty {
    padding: 10px 12px;
    font-size: 13px;
    color: @text-3;
  }

  &__at-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #f7f8fa;
    }
  }

  &__at-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__at-info {
    min-width: 0;
  }

  &__at-name {
    display: block;
    font-size: 13px;
    color: @text-1;
    .ellipsis();
  }

  &__at-fans {
    font-size: 12px;
    color: @text-3;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 13px;
    color: @text-2;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: @pink;
      background: #ffeef4;
    }
  }

  &__submit {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__count {
    font-size: 12px;
    color: @text-3;
    min-width: 28px;
    text-align: right;
  }
}

/* UP主头像区 */
.dynamic-ups {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  padding: 16px;
  margin-bottom: 12px;

  &__loading,
  &__empty {
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
    color: @text-3;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__arrow {
    width: 28px;
    height: 56px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    background: #f7f8fa;
    color: @text-2;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      color: @pink;
      background: #ffeef4;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  // 外层滚动容器：横向滚动，但完全隐藏滚动条（保留鼠标滚轮/触摸板/按钮滚动能力）
  &__scroller {
    flex: 1;
    min-width: 0;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none; // Firefox

    &::-webkit-scrollbar {
      display: none; // Chrome / Safari
    }

    -ms-overflow-style: none; // IE / Edge
  }

  &__list {
    display: inline-flex; // 关键：宽度由内容撑开，避免换行
    align-items: stretch;
    gap: 8px;
    padding: 2px 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex: 0 0 68px;
    width: 68px;
    padding: 10px 4px;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      .dynamic-ups__avatar {
        box-shadow: 0 0 0 2px @pink;
      }

      .dynamic-ups__name {
        color: @pink;
      }
    }

    &--active {
      .dynamic-ups__avatar {
        box-shadow: 0 0 0 2px @pink;
      }

      .dynamic-ups__name {
        color: @pink;
        font-weight: 600;
      }
    }

    &--hint {
      cursor: default;
      user-select: none;
      justify-content: center;
      min-width: 76px;
      flex: 0 0 auto;
      width: auto;
      padding: 10px 12px;
      background: transparent;

      &:hover {
        background: transparent;

        .dynamic-ups__avatar {
          box-shadow: none;
        }

        .dynamic-ups__name {
          color: inherit;
        }
      }
    }
  }

  &__hint-loading {
    font-size: 12px;
    color: @text-3;
    white-space: nowrap;
  }

  &__hint-end {
    font-size: 12px;
    color: #b0b3b8;
    white-space: nowrap;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    box-sizing: border-box;
    transition: box-shadow 0.2s;
  }

  &__name {
    width: 100%;
    font-size: 12px;
    color: @text-1;
    text-align: center;
    .ellipsis();
  }
}

/* 动态流 */
.dynamic-feed {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  margin: 12px 0;

  .el-empty {
    padding: 48px 0;
  }
}

/* 懒加载：加载中 / 没有更多 */
.dynamic-feed__more {
  display: flex;
  justify-content: center;
  padding: 16px 0;

  &-tip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: @text-3;
  }
}

/* 全部 / 视频投稿 */
.dynamic-tabs {
  display: flex;
  gap: 24px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  &__item {
    font-size: 15px;
    color: @text-2;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;

    &:hover {
      color: @pink;
    }

    &--active {
      color: @text-1;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: -14px;
        left: 0;
        right: 0;
        height: 3px;
        background: @pink;
        border-radius: 2px;
      }
    }
  }
}

</style>

<style lang="less">
.dynamic-item__more-popover {
  padding: 4px 0 !important;
  min-width: 100px;
}

.dynamic-item__more-menu {
  .dynamic-item__more-item {
    padding: 0 16px;
    line-height: 32px;
    font-size: 14px;
    color: @text-1;
    cursor: pointer;
    border-radius: 4px;
    margin: 0 4px;
    transition: background-color 0.15s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    &.is-danger {
      color: #f56c6c;

      &:hover {
        background-color: #fef0f0;
      }
    }
  }
}
</style>
