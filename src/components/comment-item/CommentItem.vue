<template>
  <div class="comment" :class="isSubComment ? 'sub' : ''">
    <!-- 评论主体 -->
    <div class="comment-main">
      <!-- 用户头像 -->
      <div
        class="user-avatar"
        :class="isSubComment ? 'sub' : ''"
        @mouseenter="emitAvatarHover(comment.user)"
        @mouseleave="emitAvatarLeave(comment.user)"
      >
        <UserHoverCard
          v-if="comment.user"
          :user="comment.user"
          placement="right-top"
          :auto-adjust="true"
          :is-following="userStore.followStatusMap[comment.user.uid] === true"
          @follow="handleFollowUser"
        >
          <a :href="`/space/${comment.user?.uid}`" target="_blank">
            <img :src="comment.user?.avatar" alt=""/>
          </a>
        </UserHoverCard>
        <a v-else :href="`/space/${comment.user?.uid}`" target="_blank">
          <img :src="comment.user?.avatar" alt=""/>
        </a>
      </div>
      <div class="header-and-content" :class="isSubComment ? 'second' : ''">
        <!-- 用户名 + 等级等 -->
        <div class="comment-header">
          <div class="user-name">
            <a :href="`/space/${comment.user?.uid}`" target="_blank">{{
                getUserDisplayName(comment.user)
              }}</a>
          </div>
          <div class="user-level">
            <img
              width="30"
              height="30"
              :src="getLevelIconUrl(getLevelByExp(comment.user?.exp ?? 0))"
              :alt="`Lv${getLevelByExp(comment.user?.exp ?? 0)}`"
            />
          </div>
          <div class="user-up" v-if="ownerUid === comment.user?.uid">
            <img
              width="24"
              height="24"
              :src="DEFAULT_AVATAR"
              alt=""/>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content" :class="isSubComment ? 'second' : ''">
          <p>
            <template v-if="isSecondSubComment">
              回复
              <UserHoverCard
                v-if="comment.toUser"
                :user="comment.toUser"
                placement="right-top"
                :auto-adjust="true"
                :is-following="userStore.followStatusMap[comment.toUser.uid] === true"
                :like-count="comment.toUser.like ?? 0"
                @follow="handleFollowUser"
                class="at-user-wrapper"
              >
                <a
                  :href="`/space/${comment.toUser.uid}`"
                  class="at-user"
                  target="_blank"
                >@{{ comment.toUser.username }}</a
                >
              </UserHoverCard>
              <a
                v-else
                :href="`/space/${comment.toUser?.uid}`"
                class="at-user"
                target="_blank"
              >@{{ comment.toUser?.username }}</a
              >
              :
            </template>
            <MentionContent :content="comment.content" :mention-users="comment.mentionUsers"/>
          </p>
        </div>
      </div>

      <!-- 评论底部 -->
      <div class="comment-footer">
        <div class="createDate">
          {{ formatCommentTime(comment.createTime) }}
        </div>
        <div class="like" :class="{ active: comment.liked }" @mousedown.prevent @click="handleLike">
          <i class="iconfont" :class="comment.liked ? 'icon-dianzan_kuai' : 'icon-good'"></i>
          <span class="count" style="margin-left: 5px">{{ comment.like }}</span>
        </div>
        <div class="dislike" :class="{ active: comment.disliked }" @mousedown.prevent
             @click="handleDislike">
          <i class="iconfont" :class="comment.disliked ? 'icon-diancai-mian' : 'icon-diancai'"></i>
        </div>
        <div class="reply" @mousedown.prevent @click="toggleReply">回复</div>
        <!-- 更多操作：hover .comment 时显示，移出按钮/弹窗区域延迟关闭 -->
        <div class="more-actions" @click.stop.prevent="toggleMoreMenu" @mouseenter="cancelClose"
             @mouseleave="scheduleClose">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
          <!-- 弹窗：复制链接 + 置顶（仅UP主对根评论） + 删除 -->
          <div v-if="showMoreMenu" class="more-menu" @click.stop @mouseenter="cancelClose"
               @mouseleave="scheduleClose">
            <div class="more-menu-item" @click="copyCommentLink">复制评论链接</div>
            <div v-if="canPin" class="more-menu-item" @click="handleToggleTop">
              {{ isPinned ? '取消置顶' : '置顶' }}
            </div>
            <div v-if="canDelete" class="more-menu-item danger" @click="handleDelete">删除</div>
            <div v-if="canBlock" class="more-menu-item danger" @click="openBlockDialog">加入黑名单</div>
          </div>
        </div>
      </div>

      <!-- UP主觉得很赞 -->
      <div class="up-liked" v-if="comment.upLiked && !isSubComment">
        UP主觉得很赞
      </div>

      <!-- 置顶标识 -->
      <div class="pinned-tag" v-if="isPinned && !isSubComment">
        <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor">
          <path
            d="M832 64H192a32 32 0 0 0-32 32v128a32 32 0 0 0 32 32h128v256l-128 128v64h320v128a32 32 0 0 0 64 0v-128h320v-64l-128-128V256h128a32 32 0 0 0 32-32V96a32 32 0 0 0-32-32z"/>
        </svg>
        置顶
      </div>
    </div>

    <!-- 拉黑确认弹窗 -->
    <el-dialog
      v-model="showBlockDialog"
      width="420px"
      append-to-body
      align-center
      custom-class="block-confirm-dialog"
    >
      <template #header>
        <div class="block-dialog-title">拉黑用户</div>
      </template>
      <div class="block-dialog-content">
        加入黑名单后，将自动解除双方的关注关系，禁止该用户与我互动或查看我的空间
      </div>
      <template #footer>
        <div class="block-dialog-footer">
          <el-button @click="showBlockDialog = false">取消</el-button>
          <el-button type="primary" :loading="blockLoading" @click="confirmBlock">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {useCommentStore} from '@/stores/commentStore'
import {useDynamicCommentStore} from '@/stores/dynamicCommentStore'
import {storeToRefs} from 'pinia'
import {formatCommentTime, getLevelByExp, getLevelIconUrl, getUserDisplayName} from '@/utils/utils'
import {DEFAULT_AVATAR} from '@/utils/constants'
import {useVideoStore} from '@/stores/videoStore'
import {ElMessage, ElMessageBox} from 'element-plus'
import {get, post} from '@/utils/request'
import {USER_API} from '@/api/user'
import UserHoverCard from '@/components/user-hover-card/UserHoverCard.vue'
import MentionContent from '@/components/mention-content/MentionContent.vue'
import type {User} from '@/types/api'

const videoStore = useVideoStore()
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  // 资源所属UP主uid（视频评论不传，动态评论传动态作者uid），用于判定UP主身份
  ownerUid: {
    type: Number,
    default: null,
  },
  // 内容owner（UP主）是否拉黑了我：命中则本条不允许回复（含对别人的评论）
  ownerBlockedMe: {
    type: Boolean,
    default: false,
  },
  // 评论所属资源id（视频评论不传，动态评论传动态id），用于复制评论链接
  bizId: {
    type: Number,
    default: null,
  },
  // 业务类型：video 视频评论（默认） | dynamic 动态评论
  bizType: {
    type: String,
    default: 'video',
  },
  // 使用哪个评论store：comment 视频（默认） | dynamicComment 动态
  store: {
    type: String,
    default: 'comment',
  },
})

const userStore = useUserStore()
const commentStore = useCommentStore()
const dynamicCommentStore = useDynamicCommentStore()
// 根据 store 类型选择对应的评论操作store
const activeCommentStore = computed(() =>
  props.store === 'dynamicComment' ? dynamicCommentStore : commentStore,
)
const {activeReplyCommentId} = storeToRefs(activeCommentStore.value)
const {setActiveReplyCommentId} = activeCommentStore.value
const {user} = storeToRefs(userStore)

// UP主uid：动态评论用 ownerUid，视频评论用 videoInfo
const upOwnerUid = computed<number | null | undefined>(() =>
  props.ownerUid ?? videoStore.videoInfo?.video?.uid,
)

// 判断是否是子评论
const isSubComment = ref(props.comment.rootId !== 0 || props.comment.parentId !== 0)
const isSecondSubComment = ref(props.comment.rootId !== props.comment.parentId)

// 切换回复框显示（单例模式）；owner拉黑我 或 评论作者拉黑我 时不弹回复框，只提示
const toggleReply = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  // owner级：UP主拉黑我时，本视频/动态下任何评论都不允许回复
  if (props.ownerBlockedMe) {
    ElMessage.warning('由于UP主隐私设置，你无法评论')
    return
  }
  // 作者级兜底：非owner场景下评论作者本人拉黑我
  if (await checkAuthorBlocking()) {
    ElMessage.warning('因对方隐私设置，无法进行互动')
    return
  }
  // 如果当前已显示，则关闭
  if (activeReplyCommentId.value === props.comment.id) {
    setActiveReplyCommentId(null)
  } else {
    setActiveReplyCommentId(props.comment.id)
  }
}

// 懒加载缓存：当前评论作者是否拉黑了我（null=未查）；避免重复请求
const authorBlockingMe = ref<boolean | null>(null)
async function checkAuthorBlocking(): Promise<boolean> {
  if (authorBlockingMe.value !== null) return authorBlockingMe.value
  const authorUid = props.comment.user?.uid
  if (!authorUid) {
    authorBlockingMe.value = false
    return false
  }
  try {
    const res = await get<{ code: number; data?: { blockedByMe: boolean; blockingMe: boolean } }>(
      `${USER_API.USER_BLOCK_RELATION}/${authorUid}`,
    )
    authorBlockingMe.value = res.code === 200 && !!res.data?.blockingMe
  } catch {
    authorBlockingMe.value = false
  }
  return authorBlockingMe.value
}

const replies = ref([...(props.comment.replies || [])])
watch(
  () => props.comment.replies,
  (newReplies) => {
    replies.value = [...(newReplies || [])]
  },
)

const handleLike = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const res = await activeCommentStore.value.toggleLike(props.comment.id!)
  if (!res.ok && res.message) ElMessage.warning(res.message)
}

const handleDislike = async () => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  const res = await activeCommentStore.value.toggleDislike(props.comment.id!)
  if (!res.ok && res.message) ElMessage.warning(res.message)
}

const handleFollowUser = async (uid: number) => {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  await userStore.toggleFollow(uid)
}

const emit = defineEmits<{
  (e: 'avatar-hover', user: User): void
  (e: 'avatar-leave', user: User): void
}>()

const emitAvatarHover = (user: User) => {
  if (!user) return
  emit('avatar-hover', user)
}

const emitAvatarLeave = (user: User) => {
  if (!user) return
  emit('avatar-leave', user)
}

// ====== 更多操作菜单 ======
const showMoreMenu = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

// 可删除：评论作者本人，或当前资源（视频/动态）的投稿者（UP主）
const canDelete = computed(() => {
  if (!user.value) return false
  if (props.comment.user && user.value.uid === props.comment.user.uid) return true
  return upOwnerUid.value != null && upOwnerUid.value === user.value.uid
})

// 可拉黑：已登录、评论作者存在且非本人（后端拉黑会自动双向取关）
const canBlock = computed(() => {
  if (!user.value) return false
  const authorUid = props.comment.user?.uid
  return authorUid != null && authorUid !== user.value.uid
})

// 可置顶：仅资源（视频/动态）投稿者（UP主）且为根评论
const canPin = computed(() => {
  if (!user.value) return false
  const isOwner = upOwnerUid.value != null && upOwnerUid.value === user.value.uid
  const isRoot = props.comment.rootId === 0
  return isOwner && isRoot
})

const isPinned = computed(() => props.comment.isTop === 1)

const cancelClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

// 离开按钮/菜单后延迟关闭，留出移动到菜单的时间，避免弹窗瞬间消失
const scheduleClose = () => {
  cancelClose()
  closeTimer = setTimeout(() => {
    showMoreMenu.value = false
    closeTimer = null
  }, 200)
}

const toggleMoreMenu = () => {
  cancelClose()
  showMoreMenu.value = !showMoreMenu.value
}

const copyCommentLink = async () => {
  // 动态评论复制动态页评论链接，视频评论复制视频页评论链接
  const bizPath =
    props.bizType === 'dynamic'
      ? `/dynamic?commentId=${props.comment.id}`
      : `/video/${videoStore.videoInfo?.video?.vid}?commentId=${props.comment.id}`
  const url = `${window.location.origin}${bizPath}`
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = url
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success('链接已复制')
  }
  cancelClose()
  showMoreMenu.value = false
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('删除评论后，评论下所有回复都会被删除，是否继续？', '删除评论', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const ok = await activeCommentStore.value.deleteComment(props.comment.id!)
  if (ok) {
    cancelClose()
    showMoreMenu.value = false
    ElMessage.success('删除成功')
  } else {
    ElMessage.error('删除失败，请重试')
  }
}

// ===== 拉黑确认弹窗 =====
const showBlockDialog = ref(false)
const blockLoading = ref(false)
const blockTarget = ref<{ uid?: number }>({})

// 点击菜单“加入黑名单”：记录目标并打开弹窗
const openBlockDialog = () => {
  const authorUid = props.comment.user?.uid
  if (!authorUid) return
  blockTarget.value = { uid: authorUid }
  showBlockDialog.value = true
  cancelClose()
  showMoreMenu.value = false
}

// 确认拉黑：后端会自动双向取关
const confirmBlock = async () => {
  const authorUid = blockTarget.value.uid
  if (!authorUid) return
  blockLoading.value = true
  try {
    const res = await post<{ code: number; message: string }>(`${USER_API.USER_BLOCK}/${authorUid}`)
    if (res.code === 200) {
      ElMessage.success(res.message || '已加入黑名单')
      showBlockDialog.value = false
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    blockLoading.value = false
  }
}

const handleToggleTop = async () => {
  const next = !isPinned.value
  const ok = await activeCommentStore.value.toggleCommentTop(props.comment.id!, next)
  if (ok) {
    cancelClose()
    showMoreMenu.value = false
    ElMessage.success(next ? '置顶成功' : '已取消置顶')
  } else {
    ElMessage.error('操作失败，请重试')
  }
}

</script>

<style scoped lang="less">
.comment {
  display: flex;
  padding: 8px 0 8px 68px;
  position: relative;

  // hover 时显示更多操作按钮
  .more-actions {
    opacity: 0;
    transition: opacity 0.2s;
    margin-left: auto;
    padding: 4px;
    cursor: pointer;
    border-radius: 4px;
    color: @text-3;
    position: relative;

    &:hover {
      background-color: @bg-gray;
      color: @text-2;
    }
  }

  &:hover .more-actions {
    opacity: 1;
  }

  &.sub {
    padding-left: 100px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .comment-main {
    width: 100%;

    .user-avatar {
      position: absolute;
      left: 20px;
      top: 15px;
      width: 40px;
      height: 40px;

      &.sub {
        top: 12px;
        left: 68px;
        width: 24px;
        height: 24px;
      }

      // 非 UserHoverCard 分支（user 为空）
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      // 穿透 UserHoverCard 包裹层，让头像正确填充容器且不变形
      // 注意：只针对 reference 内的头像，不要影响悬浮弹窗里的大头像（.user-hover-card__avatar）
      :deep(.user-hover-card-wrapper),
      :deep(.user-hover-card-reference) {
        display: block;
        width: 100%;
        height: 100%;
        line-height: 0;
      }

      :deep(.user-hover-card-reference) img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }
    }

    .header-and-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      &.second {
        flex-direction: row;
      }

      .comment-header {
        display: flex;
        align-items: center;

        .user-name {
          font-size: 13px;
          font-weight: 500;

          a {
            color: @text-2;
          }
        }

        .user-level {
          width: 30px;
          height: 30px;
          margin-left: 5px;
        }

        .user-up {
          display: flex;
          align-content: center;
        }
      }

      .comment-content {
        font-size: 15px;
        margin-top: 4px;
        line-height: 28px;
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;

        &.second {
          margin: 0 0 0 5px;
        }

        .at-user-wrapper {
          display: inline-block;
        }

        .at-user {
          color: #409eff;
          font-weight: bold;

          &:hover {
            color: #00BAF0;
          }
        }
      }
    }

    .comment-footer {
      display: flex;
      align-items: center;
      color: @text-3;
      font-size: 13px;
      margin-top: 5px;

      > :not(:first-child) {
        margin-left: 20px;
      }

      .like,
      .dislike,
      .reply {
        cursor: pointer;
        transition: color 0.3s;
        display: flex;
        align-items: center;
        color: @text-2;

        &:hover {
          color: @blue;
        }

        &.active {
          color: @blue;
        }

        .active-icon {
          color: @blue;
        }
      }

      .more-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 10;
        background: #fff;
        border: 1px solid @border-color;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 4px 0;
        min-width: 120px;

        .more-menu-item {
          padding: 8px 16px;
          font-size: 13px;
          color: @text-2;
          cursor: pointer;
          transition: background-color 0.15s;

          &:hover {
            background-color: @bg-gray;
            color: @blue;
          }

          &.danger:hover {
            color: #ff4d4f;
            background-color: #fff2f0;
          }
        }
      }
    }

    .up-liked {
      display: inline-block;
      margin-top: 8px;
      padding: 2px 8px;
      font-size: 12px;
      color: #ff6699;
      background-color: #fff0f5;
      border-radius: 4px;
    }

    .pinned-tag {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      margin-top: 8px;
      margin-left: 8px;
      padding: 2px 8px;
      font-size: 12px;
      color: @blue;
      background-color: #e5f7ff;
      border-radius: 4px;
    }
  }
}

@media (min-width: 1400px) {
  .comment .comment-main .user-avatar {
    width: 48px;
    height: 48px;
    left: 7px;
  }
}
</style>

<!-- 拉黑确认弹窗样式：el-dialog append-to-body 挂到 body，scoped 无法命中，故用全局 -->
<style lang="less">
.block-confirm-dialog {
  border-radius: 12px;

  .el-dialog__header {
    margin-right: 0;
    padding-bottom: 0;
  }

  .block-dialog-title {
    width: 100%;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #18191c;
  }

  .el-dialog__body {
    padding: 20px 28px 8px;
  }

  .block-dialog-content {
    text-align: center;
    font-size: 14px;
    line-height: 24px;
    color: #f59e0b;
  }

  .block-dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-bottom: 8px;

    .el-button {
      min-width: 96px;
      border-radius: 6px;
    }
  }
}
</style>
