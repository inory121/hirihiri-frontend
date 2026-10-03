<template>
  <div class="dynamic-item">
    <!-- 详情模式（普通动态）：大标题独立于作者行上方，自身不可点击跳转 -->
    <div v-if="detail && item.type === 0 && item.title"
         class="dynamic-item__detail-title">{{ item.title }}</div>

    <!-- 置顶标记 -->
    <span v-if="item.isTop === 1" class="dynamic-item__top">置顶</span>

    <!-- 右上角操作：三点菜单（仅本人可删时显示），hover 触发弹窗 -->
    <el-popover
      v-if="userStore.isLogin && item.uid === userStore.user?.uid"
      :visible="getMoreVisible()"
      @update:visible="(val: any) => setMoreVisible(val)"
      trigger="hover"
      placement="bottom-end"
      :width="100"
      :offset="4"
      popper-class="dynamic-item__more-popover"
    >
      <template #reference>
        <button
          class="dynamic-item__menu-btn"
          type="button"
          aria-label="更多操作"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </template>
      <div class="dynamic-item__more-menu">
        <div class="dynamic-item__more-item is-danger"
             @click="handleCardCommand('delete')">
          删除
        </div>
      </div>
    </el-popover>

    <!-- ========== 左侧大头像（所有动态统一保留） ========== -->
    <div class="dynamic-item__avatar-wrap">
      <UserHoverCard v-if="item.user" :user="item.user" placement="right-top"
                     :auto-adjust="true"
                     :is-following="userStore.followStatusMap[item.user.uid] === true"
                     @follow="handleHoverCardFollow">
        <a class="dynamic-item__avatar-link" :href="`/space/${item.uid}`"
           target="_blank">
          <img class="dynamic-item__avatar" :src="item.user.avatar || defaultAvatar"
               alt=""/>
        </a>
      </UserHoverCard>
      <a v-else class="dynamic-item__avatar-link" :href="`/space/${item.uid}`"
         target="_blank">
        <img class="dynamic-item__avatar" :src="defaultAvatar" alt=""/>
      </a>
    </div>

    <!-- ========== 右侧内容 ========== -->
    <div class="dynamic-item__body">
      <!-- 顶部信息行：用户名 + 时间（视频动态时在时间后标注 投稿了视频/分享了视频） -->
      <div class="dynamic-item__info">
        <a class="dynamic-item__name" :href="`/space/${item.uid}`" target="_blank">
          {{ getUserDisplayName(item.user, `UID:${item.uid}`) }}
        </a>
        <a
          v-if="!detail"
          class="dynamic-item__time dynamic-item__linkable"
          :href="`/dynamic/${item.id}`"
          target="_blank"
          title="查看动态详情"
        >
          {{ formatTime(item.createTime) }}
          <template v-if="item.type === 2"> · 投稿了视频</template>
        </a>
        <!-- 详情页：当前动态时间不可点击跳转 -->
        <span v-else class="dynamic-item__time">
          {{ formatTime(item.createTime) }}
          <template v-if="item.type === 2"> · 投稿了视频</template>
        </span>
      </div>

      <!-- ============ 普通动态：标题/内容/图片（详情模式下移到根级整行展示） ============ -->
      <template v-if="item.type === 0 && !detail">
        <div v-if="item.title" class="dynamic-item__title dynamic-item__linkable"
             @click="openDynamicPage($event, item.id)">{{ item.title }}
        </div>
        <div v-if="item.content" class="dynamic-item__content dynamic-item__linkable"
             @click="openDynamicPage($event, item.id)">{{ item.content }}
        </div>
        <div v-if="item.images && item.images.length > 0" class="dynamic-item__images"
             :class="`dynamic-item__images--${Math.min(item.images.length, 3)}`">
          <el-image
            v-for="(img, idx) in item.images"
            :key="idx"
            class="dynamic-item__img"
            :src="img"
            :preview-src-list="item.images"
            :initial-index="idx"
            fit="cover"
            preview-teleported
          />
        </div>
      </template>

      <!-- ============ 转发动态（type=3）：直接显示转发者自己写的文字 + 内嵌被转发原动态灰卡 ============ -->
      <template v-else-if="item.type === 3">
        <template v-if="item.content && item.content.trim()">
          <div :class="['dynamic-item__content', 'dynamic-item__content--repost', {'dynamic-item__linkable': !detail}]"
               @click="openDynamicPage($event, item.id)">
            <template v-for="(part, idx) in splitRepostMentions(item.content, getRepostChainUserMap(item))" :key="idx">
              <UserHoverCard
                v-if="part.type === 'mention' && part.user"
                :user="part.user"
                placement="right-top"
                :auto-adjust="true"
                :is-following="userStore.followStatusMap[part.user.uid] === true"
                @follow="handleHoverCardFollow"
                class="dynamic-item__repost-mention-hover"
              >
                <a
                  class="dynamic-item__repost-mention"
                  :href="`/space/${part.user.uid}`"
                  target="_blank"
                >{{ part.text }}</a>
              </UserHoverCard>
              <template v-else-if="part.type === 'mention'">
                <span class="dynamic-item__repost-mention">{{ part.text }}</span>
              </template>
              <template v-else>{{ part.text }}</template>
            </template>
          </div>
        </template>
        <template v-else>
          <div :class="['dynamic-item__content', {'dynamic-item__linkable': !detail}]"
               @click="openDynamicPage($event, item.id)">转发动态</div>
        </template>
        <!-- 内嵌被转发的原动态灰卡（递归到最原始的非转发动态） -->
        <div v-if="item.parent"
             class="dynamic-item__video-wrap dynamic-item__parent-wrap">
          <template v-for="original in [getOriginalDynamic(item.parent)]" :key="original?.id || 'deleted'">
            <template v-if="original">
              <!-- 原动态发布者：小头像 + 用户名 -->
              <div class="dynamic-item__video-topic">
                <UserHoverCard
                  v-if="original.user"
                  :user="original.user"
                  placement="right-top"
                  :auto-adjust="true"
                  :is-following="userStore.followStatusMap[original.user.uid] === true"
                  @follow="handleHoverCardFollow"
                  class="dynamic-item__video-topic-hover"
                >
                  <img
                    class="dynamic-item__video-topic-avatar"
                    :src="original.user.avatar || defaultAvatar"
                    alt=""
                  />
                </UserHoverCard>
                <img
                  v-else
                  class="dynamic-item__video-topic-avatar"
                  :src="defaultAvatar"
                  alt=""
                />
                <UserHoverCard
                  v-if="original.user"
                  :user="original.user"
                  placement="right-top"
                  :auto-adjust="true"
                  :is-following="userStore.followStatusMap[original.user.uid] === true"
                  @follow="handleHoverCardFollow"
                  class="dynamic-item__video-topic-hover"
                >
                  <a
                    class="dynamic-item__video-topic-name"
                    :href="`/space/${original.uid}`"
                    target="_blank"
                  >
                    {{ getUserDisplayName(original.user, `UID:${original.uid}`) }}
                  </a>
                </UserHoverCard>
                <a
                  v-else
                  class="dynamic-item__video-topic-name"
                  :href="`/space/${original.uid}`"
                  target="_blank"
                >
                  {{ getUserDisplayName(original.user, `UID:${original.uid}`) }}
                </a>
                <span v-if="original.type === 2" class="dynamic-item__video-topic-tag">投稿了视频</span>
                <span v-else-if="original.type === 1" class="dynamic-item__video-topic-tag">分享了视频</span>
              </div>

              <!-- 原动态：普通动态（type=0） -->
              <template v-if="original.type === 0">
                <div v-if="original.title" class="dynamic-item__parent-title dynamic-item__linkable"
                     @click="openDynamicPage($event, original.id)">
                  {{ original.title }}
                </div>
                <div v-if="original.content" class="dynamic-item__parent-content dynamic-item__linkable"
                     @click="openDynamicPage($event, original.id)">
                  {{ original.content }}
                </div>
                <div
                  v-if="original.images && original.images.length > 0"
                  class="dynamic-item__images"
                  :class="`dynamic-item__images--${Math.min(original.images.length, 3)}`"
                >
                  <el-image
                    v-for="(img, idx) in original.images"
                    :key="idx"
                    class="dynamic-item__img"
                    :src="img"
                    :preview-src-list="original.images"
                    :initial-index="idx"
                    fit="cover"
                    preview-teleported
                  />
                </div>
              </template>

              <!-- 原动态：视频动态（type=1/2） -->
              <template v-else-if="original.type >= 1 && original.type <= 2 && original.video">
<!--                <div v-if="original.title" class="dynamic-item__parent-title dynamic-item__linkable"-->
<!--                     @click="openDynamicPage($event, original.id)">-->
<!--                  {{ original.title }}-->
<!--                </div>-->
                <div
                  v-if="original.content && (original.type === 1 || original.content !== original.video.video.title)"
                  class="dynamic-item__parent-content dynamic-item__linkable"
                  @click="openDynamicPage($event, original.id)"
                >{{ original.content }}
                </div>
                <div
                  v-if="getTagList(original.video.video.tags).length"
                  class="dynamic-item__video-hashtags"
                >
                  <el-tag
                    v-for="tag in getTagList(original.video.video.tags)"
                    :key="tag"
                    class="dynamic-item__video-hashtag"
                    :disable-transitions="false"
                  >
                    <a
                      :href="`/search/video?keyword=${tag}`"
                      target="_blank"
                    >#{{ tag }}#</a>
                  </el-tag>
                </div>
                <InlineVideoCard
                  class="inline-video-card--plain"
                  :video="original.video.video"
                  :stat="original.video.stat"
                />
              </template>

              <!-- 兜底：若最原始动态仍是转发动态（异常数据），简略展示 -->
              <template v-else-if="original.type === 3">
                <div class="dynamic-item__parent-content dynamic-item__parent-content--repost">
                  转发动态
                </div>
              </template>
            </template>
            <div v-else class="dynamic-item__parent-deleted">原动态已被删除</div>
          </template>
        </div>
        <div v-else class="dynamic-item__parent-deleted">原动态已被删除</div>
      </template>

      <!-- ============ 视频动态：投稿视频平铺卡片；分享视频与转发视频同构（附言 + 内嵌灰卡） ============ -->
      <template v-else-if="item.video">
        <!-- 分享视频（type=1）：写了文字显示文字，没写则显示"分享视频"（同转发兜底文案） -->
        <template v-if="item.type === 1">
          <div
            v-if="item.content && item.content.trim()"
            :class="['dynamic-item__content', {'dynamic-item__linkable': !detail}]"
            @click="openDynamicPage($event, item.id)"
          >{{ item.content }}
          </div>
          <div v-else :class="['dynamic-item__content', {'dynamic-item__linkable': !detail}]"
               @click="openDynamicPage($event, item.id)">分享视频</div>

          <!-- 内嵌原视频灰卡（与转发动态的原动态灰卡同构） -->
          <div class="dynamic-item__video-wrap dynamic-item__parent-wrap">
            <div class="dynamic-item__video-topic">
              <img
                class="dynamic-item__video-topic-avatar"
                :src="item.video.user?.avatar || defaultAvatar"
                alt=""
              />
              <a
                class="dynamic-item__video-topic-name"
                :href="`/space/${item.video.video.uid}`"
                target="_blank"
              >
                {{
                  getUserDisplayName(item.video.user, `UID:${item.video.video.uid}`)
                }}
              </a>
              <span class="dynamic-item__video-topic-tag">投稿了视频</span>
            </div>

            <!-- 话题标签（el-tag 风格，与视频页简介一致） -->
            <div
              v-if="getTagList(item.video.video.tags).length"
              class="dynamic-item__video-hashtags"
            >
              <el-tag
                v-for="tag in getTagList(item.video.video.tags)"
                :key="tag"
                class="dynamic-item__video-hashtag"
                :disable-transitions="false"
              >
                <a
                  :href="`/search/video?keyword=${tag}`"
                  target="_blank"
                >#{{ tag }}#</a>
              </el-tag>
            </div>

            <InlineVideoCard
              class="inline-video-card--plain"
              :video="item.video.video"
              :stat="item.video.stat"
            />
          </div>
        </template>

        <!-- 投稿视频（type=2）：话题标签 + 平铺视频卡 -->
        <template v-else>
          <!-- 话题标签（el-tag 风格，与视频页简介一致） -->
          <div
            v-if="getTagList(item.video.video.tags).length"
            class="dynamic-item__video-hashtags"
          >
            <el-tag
              v-for="tag in getTagList(item.video.video.tags)"
              :key="tag"
              class="dynamic-item__video-hashtag"
              :disable-transitions="false"
            >
              <a
                :href="`/search/video?keyword=${tag}`"
                target="_blank"
              >#{{ tag }}#</a>
            </el-tag>
          </div>

          <!-- 视频卡（自带灰底与内边距，直接平铺） -->
          <InlineVideoCard
            :video="item.video.video"
            :stat="item.video.stat"
          />
        </template>
      </template>

      <!-- 底部操作栏（所有动态统一；详情页隐藏，用右侧浮动操作栏替代） -->
      <div v-if="!hideActions" class="dynamic-item__actions">
        <button
          class="dynamic-item__action"
          :class="{ 'is-active': repostOpen }"
          @click="toggleRepost"
        >
          <el-icon>
            <Share/>
          </el-icon>
          <span v-if="!item.repostCount">转发</span>
          <span v-else class="dynamic-item__action-count">{{
              formatNumber(item.repostCount)
            }}</span>
        </button>
        <button
          class="dynamic-item__action"
          :class="{ 'is-active': commentOpen }"
          @click="toggleCommentArea"
        >
          <el-icon>
            <ChatDotRound/>
          </el-icon>
          <span v-if="!item.commentCount">评论</span>
          <span v-else class="dynamic-item__action-count">{{
              formatNumber(item.commentCount)
            }}</span>
        </button>
        <button
          class="dynamic-item__action"
          :class="{ 'is-active': item.liked }"
          @click="handleLike"
        >
          <svg viewBox="0 0 24 24" :fill="item.liked ? 'currentColor' : 'none'"
               width="15" height="15"
               stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          <span v-if="!item.likeCount">点赞</span>
          <span v-else class="dynamic-item__action-count">{{
              formatNumber(item.likeCount)
            }}</span>
        </button>
      </div>

      <!-- 转发输入框（展开后显示在操作栏下方） -->
      <div
        v-if="repostOpen"
        class="dynamic-item__repost"
      >
        <img
          class="dynamic-item__repost-avatar"
          :src="userStore.user?.avatar || defaultAvatar"
          alt=""
        />
        <div class="dynamic-item__repost-body">
          <div
            class="dynamic-item__repost-input"
            contenteditable="true"
            :ref="(el) => setRepostInputRef(el)"
            @input="onRepostInput($event)"
            @paste="onRepostPaste"
          ></div>
          <div class="dynamic-item__repost-footer">
            <div class="dynamic-item__repost-tools">
              <button class="dynamic-item__repost-tool" type="button" aria-label="表情">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                     stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
            </div>
            <div class="dynamic-item__repost-submit">
                        <span
                          class="dynamic-item__repost-count"
                          :class="{ 'is-over': repostContent.length > REPOST_MAX }"
                        >{{ repostContent.length }} / {{ REPOST_MAX }}</span>
              <el-button
                type="primary"
                size="small"
                :loading="repostLoading"
                @click="handleRepostSubmit"
              >转发
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情模式（普通动态）：正文/图片独立整行，与标题左对齐，自身不可点击跳转 -->
    <template v-if="detail && item.type === 0">
      <div v-if="item.content" class="dynamic-item__content dynamic-item__detail-row">{{ item.content }}
      </div>
      <div v-if="item.images && item.images.length > 0" class="dynamic-item__images dynamic-item__detail-row"
           :class="`dynamic-item__images--${Math.min(item.images.length, 3)}`">
        <el-image
          v-for="(img, idx) in item.images"
          :key="idx"
          class="dynamic-item__img"
          :src="img"
          :preview-src-list="item.images"
          :initial-index="idx"
          fit="cover"
          preview-teleported
        />
      </div>
    </template>

    <!-- 评论区（点击评论展开，卡片根部整行，与卡片最左对齐） -->
    <div v-if="commentOpen" class="dynamic-item__comment-area">
      <CommentArea
        biz-type="dynamic"
        :biz-id="item.id"
        :owner-uid="item.uid"
        :bottom-padding="10"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {nextTick, ref} from 'vue'
import type {ComponentPublicInstance} from 'vue'
import {useRoute} from 'vue-router'
import UserHoverCard from '@/components/user-hover-card/UserHoverCard.vue'
import InlineVideoCard from '@/components/inline-video-card/InlineVideoCard.vue'
import CommentArea from '@/components/comment-area/CommentArea.vue'
import {useUserStore} from '@/stores/userStore'
import {useDynamicStore} from '@/stores/dynamicStore'
import {post} from '@/utils/request'
import {DYNAMIC_API} from '@/api/dynamic'
import {formatNumber, formatTime, getUserDisplayName} from '@/utils/utils.ts'
import {ChatDotRound, Share} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import type {Dynamic, User} from '@/types/api'
import {DEFAULT_AVATAR} from '@/utils/constants'

const props = defineProps<{
  item: Dynamic
  // 详情页隐藏卡片底部操作栏（改用页面右侧浮动操作栏）
  hideActions?: boolean
  // 详情页布局：普通动态大标题置顶、正文/图片整行（B 站 t.bilibili.com 风格）
  detail?: boolean
}>()

const emit = defineEmits<{
  // 转发成功、删除成功等需要父组件刷新列表
  (e: 'refresh'): void
}>()

const userStore = useUserStore()
const dynamicStore = useDynamicStore()

const defaultAvatar = DEFAULT_AVATAR

const route = useRoute()

// 点击动态文字跳转对应动态详情：文字属于哪条动态就跳哪条
//（转发者文字→转发动态详情；灰卡内原动态文字→原动态详情）
// 详情页内当前动态自身文字不可点击，仅嵌套的原动态文字可跳转
const openDynamicPage = (e: MouseEvent, id?: number) => {
  if (!id) return
  // 点击的是卡片内部链接（@用户、话题等 <a>）时不拦截
  if ((e.target as HTMLElement | null)?.closest?.('a')) return
  // 详情页内点击当前动态自身文字不跳转（列表页 route.params.dynamicId 为 undefined，不受影响）
  if (Number(route.params.dynamicId) === id) return
  window.open(`/dynamic/${id}`, '_blank')
}

// 本卡片内部状态（互不干扰）
const commentOpen = ref(false)
const repostOpen = ref(false)
const repostContent = ref('')
const repostQuote = ref<{ username: string; content: string } | null>(null)
const repostLoading = ref(false)
const moreVisible = ref(false)

// contenteditable DOM 节点引用
const repostInputEl = ref<HTMLElement | null>(null)

const setRepostInputRef = (el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof Element) {
    repostInputEl.value = el as HTMLElement
  } else if (el) {
    repostInputEl.value = (el as ComponentPublicInstance).$el as HTMLElement
  } else {
    repostInputEl.value = null
  }
}

const getMoreVisible = (): boolean => moreVisible.value
const setMoreVisible = (val: boolean | undefined) => {
  moreVisible.value = !!val
}

// ======================== 删除 ========================
const handleCardCommand = async (command: string | number | object) => {
  if (command === 'delete') {
    const ok = await dynamicStore.deleteDynamic(props.item)
    if (ok) {
      emit('refresh')
    }
  }
}

// ======================== 点赞 ========================
const handleLike = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  await dynamicStore.toggleLike(props.item.id)
}

// ======================== 评论区展开/收起 ========================
const toggleCommentArea = () => {
  commentOpen.value = !commentOpen.value
  if (commentOpen.value && repostOpen.value) {
    repostOpen.value = false
  }
}

// ======================== 转发 ========================
// 转义 HTML 特殊字符，避免注入内容被当作标签
const escapeHtml = (s: string): string => {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// 把文本中所有 "//@用户名:" 形式的用户名高亮为蓝色（嵌套多层转发也能全部命中）
const highlightRepostQuote = (raw: string): string => {
  if (!raw) return ''
  return raw.replace(/\/\/@([^\s@:：，。,，]+):/g, (m, name) => {
    return `//@<span class="repost-mention">${escapeHtml(name)}</span>:`
  })
}

// 打开转发框时把引用 + 已保存内容写入 DOM（只写一次，之后完全由 DOM 控制）
const initRepostInput = () => {
  const el = repostInputEl.value
  if (!el) return
  const quote = repostQuote.value
  const saved = repostContent.value || ''
  let html = ''
  // 引用部分仅在"没有已保存内容"时填充一次（避免关闭再打开时重复填充）
  if (quote && !saved) {
    const head = `//@<span class="repost-mention">${escapeHtml(quote.username)}</span>:`
    const body = highlightRepostQuote(escapeHtml(quote.content || '转发动态'))
    html += `${head}${body} `
  }
  html += escapeHtml(saved)
  el.innerHTML = html
  // 立即同步一次，确保"所见即所得"的引用即提交内容
  repostContent.value = el.innerText || ''
  // 光标移到末尾
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

// 获取原动态作者名
const getDynamicAuthorName = (dynamic?: Dynamic | null): string => {
  if (!dynamic) return ''
  return dynamic.user?.username || dynamic.user?.nickname || `UID:${dynamic.uid}`
}

// 递归获取最原始的非转发动态（穿透多层转发）
const getOriginalDynamic = (dynamic?: Dynamic | null): Dynamic | null => {
  if (!dynamic) return null
  if (dynamic.type !== 3 || !dynamic.parent) return dynamic
  return getOriginalDynamic(dynamic.parent)
}

// 从转发动态 content 中提取"转发者自己写的文字"（剥离"//@原作者:原正文"前缀）
const extractRepostText = (dynamic: Dynamic): string => {
  if (!dynamic.content) return ''
  const parentAuthor = getDynamicAuthorName(dynamic.parent)
  const parentContent = (dynamic.parent?.content || '').trim()
  const prefix = `//@${parentAuthor}:${parentContent} `
  if (dynamic.content.startsWith(prefix)) {
    return dynamic.content.slice(prefix.length).trim()
  }
  return dynamic.content.replace(/^\/\/@[^:]+:.*?(\s|$)/s, '').trim()
}

// 构建转发引用条数据
const buildRepostQuote = (item: Dynamic): { username: string; content: string } | null => {
  if (!item?.parent) return null
  const username = getDynamicAuthorName(item)
  const text = extractRepostText(item)
  return { username, content: text || '转发动态' }
}

// 收集转发链上所有作者：username(小写) -> User
const getRepostChainUserMap = (item: Dynamic): Map<string, User> => {
  const map = new Map<string, User>()
  let cur: Dynamic | null | undefined = item.parent
  let guard = 0
  while (cur && guard < 10) {
    guard++
    const name = getDynamicAuthorName(cur)
    if (name && cur.user) {
      map.set(name.toLowerCase(), cur.user)
    }
    cur = cur.parent
  }
  return map
}

// 解析转发正文中的 @username（含 //@username），返回分段
const splitRepostMentions = (
  content: string,
  userMap: Map<string, User>,
): Array<{ type: 'text' | 'mention'; text: string; user?: User }> => {
  const parts: Array<{ type: 'text' | 'mention'; text: string; user?: User }> = []
  if (!content) return parts
  const pattern = /@([^\s@:：，。,，]+)/g
  let lastIndex = 0
  for (const match of content.matchAll(pattern)) {
    const token = match[1]
    const atIndex = match.index ?? 0
    if (!token) continue
    const user = userMap.get(token.toLowerCase())
    if (atIndex > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, atIndex) })
    }
    if (user) {
      parts.push({ type: 'mention', text: `@${token}`, user })
    } else {
      parts.push({ type: 'text', text: match[0] })
    }
    lastIndex = atIndex + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) })
  }
  return parts
}

// hover 卡片内关注按钮
const handleHoverCardFollow = async (uid: number) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  await userStore.toggleFollow(uid)
}

// 切换转发输入框展开/收起
const toggleRepost = () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  repostOpen.value = !repostOpen.value
  if (repostOpen.value) {
    commentOpen.value = false
    repostQuote.value = buildRepostQuote(props.item)
    nextTick(() => {
      initRepostInput()
    })
  }
}

// contenteditable 输入事件：同步用户输入文本（所见即所得）
const onRepostInput = (event: Event) => {
  const el = event.target as HTMLElement
  if (!el) return
  repostContent.value = el.innerText || ''
}

// contenteditable 粘贴事件：强制纯文本，避免带入样式
const onRepostPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

// 内容最大字数
const REPOST_MAX = 1000

// 点击转发按钮：发布转发动态
const handleRepostSubmit = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const content = (repostContent.value || '').trim()
  if (content.length > REPOST_MAX) {
    ElMessage.warning(`转发内容不能超过${REPOST_MAX}字`)
    return
  }
  repostLoading.value = true
  try {
    const res = await post<{ code: number; message: string; data: string }>(
      DYNAMIC_API.PUBLISH,
      {
        title: '',
        content,
        type: 3,
        vid: null,
        parentId: props.item.id,
        images: [],
      },
    )
    if (res.code === 200) {
      ElMessage.success(res.message || '转发成功')
      repostContent.value = ''
      const el = repostInputEl.value
      if (el) el.innerText = ''
      repostOpen.value = false
      emit('refresh')
    } else {
      ElMessage.error(res.message || '转发失败')
    }
  } catch (e) {
    console.log('转发动态失败:', e)
    ElMessage.error('转发失败，请稍后重试')
  } finally {
    repostLoading.value = false
  }
}

// 从视频 tags（逗号或换行分隔字符串）中拆分成标签数组
const getTagList = (tags?: string | null): string[] => {
  if (!tags) return []
  return tags.split(/[,\n]/).map(t => t.trim()).filter(Boolean)
}
</script>

<style scoped lang="less">
.dynamic-item {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;

  &__top {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    padding: 4px 10px;
    border-radius: 0 8px 0 8px;
    background: #ffeef4;
    color: #ff6699;
    font-size: 12px;
    font-weight: 500;
  }

  &__menu-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: @text-3;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: #f0f1f2;
      color: @text-1;
    }
  }

  &__more-menu {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
  }

  &__more-item {
    padding: 6px 12px;
    font-size: 13px;
    color: @text-1;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: #f5f6f7;
    }

    &.is-danger {
      color: #f56c6c;

      &:hover {
        background: #fef0f0;
      }
    }
  }

  // ===== 左侧头像 =====
  &__avatar-wrap {
    flex-shrink: 0;
  }

  &__avatar-link {
    display: block;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  // ===== 右侧主体 =====
  &__body {
    flex: 1;
    min-width: 0;
    width: calc(100% - 52px);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 17px;
    font-weight: 500;
    color: @text-1;
    text-decoration: none;

    &:hover {
      color: @blue;
    }
  }

  &__time {
    display: inline-block;
    font-size: 13px;
    color: @text-3;
    text-decoration: none;
  }

  // 可点击跳转详情的文字（标题/正文/原动态文字），B 站风格 hover 变蓝
  &__linkable {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: @blue;
    }
  }

  // 详情模式（普通动态）：大标题置顶，字号加粗独立于作者行
  &__detail-title {
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
    color: @text-1;
    word-break: break-word;
  }

  // 详情模式整行块（正文/图片），与标题左对齐
  &__detail-row {
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px;
  }

  &__title {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 700;
    color: @text-1;
    word-break: break-word;
  }

  &__content {
    margin-top: 6px;
    font-size: 15px;
    line-height: 1.6;
    color: @text-1;
    white-space: pre-wrap;
    word-break: break-word;

    &--repost {
      color: @text-1;
      // 转发正文按 B 站风格单行显示，超长省略号截断
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__repost-mention {
    color: @blue;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: @pink;
    }
  }

  &__repost-mention-hover {
    // 必须保持 inline-block：内部 user-hover-card-reference 是 block 级，
    // 若外层为 inline 会被拆成匿名块导致换行；inline-block 作为一个整体参与文本流
    display: inline-block;
  }

  // ===== 图片 =====
  &__images {
    display: grid;
    gap: 4px;
    margin-top: 8px;

    &--1 {
      grid-template-columns: repeat(1, 1fr);
      max-width: 220px;
    }

    &--2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    object-fit: cover;
    cursor: zoom-in;
  }

  // ===== 视频/原动态灰卡 =====
  &__video-wrap {
    margin-top: 10px;
    padding: 12px;
    border-radius: 8px;
    background: #f7f8fa;
  }

  &__parent-wrap {
    margin-top: 10px;
  }

  &__video-topic {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    &-name {
      font-size: 15px;
      color: @text-1;
      text-decoration: none;

      &:hover {
        color: @blue;
      }
    }

    &-tag {
      font-size: 13px;
      color: @text-3;
    }
  }

  &__parent-title {
    margin-top: 8px;
    font-size: 15px;
    font-weight: 700;
    color: @text-1;
    word-break: break-word;
  }

  &__parent-content {
    margin-top: 6px;
    font-size: 15px;
    line-height: 1.6;
    color: @text-1;
    white-space: pre-wrap;
    word-break: break-word;

    &--repost {
      color: @text-3;
    }
  }

  &__parent-deleted {
    margin-top: 8px;
    font-size: 13px;
    color: @text-3;
  }

  &__video-hashtags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  &__video-hashtag {
    a {
      color: inherit;
      text-decoration: none;
    }
  }

  // ===== 操作栏 =====
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-top: 20px;
    padding-right: 20px;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: none;
    padding: 0;
    font-size: 13px;
    color: @text-3;
    cursor: pointer;
    transition: color 0.2s;

    .el-icon {
      font-size: 15px;
    }

    &-count {
      font-size: 12px;
      margin-left: 2px;
    }

    &:hover {
      color: @pink;
    }

    &.is-active {
      color: @pink;
    }
  }

  // 评论区（点击评论按钮展开，卡片根部整行，与卡片最左对齐）
  &__comment-area {
    width: 100%;
    box-sizing: border-box;
    margin-top: 10px;
    padding: 12px 12px 0;
    border-radius: 8px;
  }

  // 转发输入框（卡片内展开）
  &__repost {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 10px;
    padding: 12px;
    border-radius: 8px;
    background: #f7f8fa;
  }

  &__repost-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #eee;
  }

  &__repost-body {
    flex: 1;
    min-width: 0;
  }

  &__repost-input {
    background: #fff;
    border: 1px solid #e3e5e7;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
    padding: 10px 12px;
    color: @text-1;
    min-height: 72px;
    max-height: 160px;
    overflow-y: auto;
    outline: none;
    transition: all 0.2s;
    white-space: pre-wrap;
    word-break: break-word;

    &:focus,
    &:hover {
      border-color: @pink;
      box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
    }

    &:empty::before {
      content: '请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。';
      color: #b0b3b8;
      pointer-events: none;
    }

    // 输入框内自动填充的引用：//@username:content，username 蓝色不可点击
    :deep(.repost-mention) {
      color: @blue;
      cursor: pointer;
      text-decoration: none;
      user-select: none;

      &:hover {
        color: @pink;
      }
    }
  }

  &__repost-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  &__repost-tools {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__repost-tool {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: @text-3;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #fff;
      color: @pink;
    }
  }

  &__repost-submit {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__repost-count {
    font-size: 12px;
    color: #b0b3b8;

    &.is-over {
      color: #f56c6c;
    }
  }

  // parent（被转发原动态灰卡）辅助样式
  &__parent-wrap {
    margin-top: 10px;
  }
}

// 弹窗：三点菜单
:deep(.dynamic-item__more-popover) {
  padding: 4px !important;
}
</style>
