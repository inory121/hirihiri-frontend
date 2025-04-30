<template>
  <div class="comment" :class="isSubComment ? 'sub' : ''">
    <!-- 评论主体 -->
    <div class="comment-main">
      <!-- 用户头像 -->
      <div class="user-avatar" :class="isSubComment ? 'sub' : ''">
        <a href="#">
          <img :src="comment.user?.avatar" alt="" />
        </a>
      </div>
      <div class="header-and-content" :class="isSubComment ? 'second' : ''">
        <!-- 用户名 + 等级等 -->
        <div class="comment-header">
          <div class="user-name">
            <a href="#">{{ comment.user?.username }}</a>
          </div>
          <div class="user-level">
            <img
              width="30"
              height="30"
              src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/level_6.svg"
              alt=""
            />
          </div>
          <div class="user-up" v-if="videoInfo.user.uid === comment.user?.uid">
            <img
              width="24"
              height="24"
              src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/up_pb.svg"
            />
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content" :class="isSubComment ? 'second' : ''">
          <p>
            <template v-if="isSecondSubComment">
              回复
              <a href="#" class="at-user">@{{ comment.toUser?.username }}</a>
            </template>
            {{ comment.content }}
          </p>
        </div>
      </div>

      <!-- 评论底部 -->
      <div class="comment-footer">
        <div class="createDate">
          {{ formatCommentTime(comment.createDate) }}
        </div>
        <div class="like">
          <el-icon>
            <CircleCheck />
          </el-icon>
          {{ comment.like }}
        </div>
        <div class="dislike">
          <el-icon>
            <CircleClose />
          </el-icon>
        </div>
        <div class="reply" @click="toggleReply">回复</div>
      </div>

      <!-- 回复输入框 -->
      <div class="commentbox" v-if="showReplyBox">
        <div class="sub-user-avatar">
          <img v-if="userStore.isLogin" :src="user.avatar" alt="" />
          <img v-else src="https://hirihiri.oss-cn-nanjing.aliyuncs.com/noface.jpg" alt="" />
        </div>
        <div class="editor edit" v-if="userStore.isLogin">
          <el-input
            v-model="subComment"
            style="height: 50px"
            :placeholder="`@${comment.user?.username}`"
            border="6"
          ></el-input>
          <el-button type="primary" @click="sendSubComment" style="margin-left: 10px" size="large">
            发送
          </el-button>
        </div>
        <div class="edit" v-else>
          <span>请先</span>
          <el-button type="primary" size="small" @click="userStore.showLoginWindow = true"
            >登录
          </el-button>
          <span>后发表评论 (・ω・)</span>
        </div>
      </div>
    </div>
  </div>
  <!--  <el-divider style="margin: 20px 0" />-->
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCommentStore } from '@/stores/commentStore'
import { storeToRefs } from 'pinia'
import { formatCommentTime } from '@/utils/utils'
import { useVideoStore } from '@/stores/videoStore'

const videoStore = useVideoStore()
const { videoInfo } = storeToRefs(videoStore)
const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
})

const userStore = useUserStore()
const commentStore = useCommentStore()
const { activeReplyCommentId } = storeToRefs(commentStore)
const { setActiveReplyCommentId } = commentStore
const { user } = storeToRefs(userStore)

// 判断当前评论是否需要显示回复框
const showReplyBox = computed(() => {
  return activeReplyCommentId.value === props.comment.id
})
const subComment = ref('')

// 判断是否是子评论
const isSubComment = ref(props.comment.rootId !== 0 || props.comment.parentId !== 0)
const isSecondSubComment = ref(props.comment.rootId !== props.comment.parentId)
// 切换回复框显示（单例模式）
const toggleReply = () => {
  if (userStore.isLogin) {
    // 如果当前已显示，则关闭
    if (showReplyBox.value) {
      setActiveReplyCommentId(null)
    } else {
      setActiveReplyCommentId(props.comment.id)
    }
  } else {
    userStore.showLoginWindow = true
  }
}

const replies = ref([...(props.comment.replies || [])])
watch(
  () => props.comment.replies,
  (newReplies) => {
    replies.value = [...(newReplies || [])]
  },
)
// 发送子评论
const sendSubComment = async () => {
  if (!props.comment.vid || !subComment.value.trim()) return
  console.log(props.comment)
  const newComment = await commentStore.sendComment({
    vid: props.comment.vid,
    uid: user.value.uid,
    content: subComment.value,
    rootId: props.comment.rootId === 0 ? props.comment.id : props.comment.rootId,
    parentId: props.comment.id,
    toUserId: props.comment.user?.uid,
  })
  console.log(newComment)
  if (newComment) {
    await commentStore.getComment(props.comment.vid)
    subComment.value = ''
    setActiveReplyCommentId(null)
  }
}
</script>

<style scoped lang="less">
.comment {
  display: flex;
  padding-left: 68px;
  padding-top: 22px;
  position: relative;

  &:not(.sub) {
    border-top: 1px solid #e3e5e7;
    margin-top: 10px;
  }

  &:first-child {
    border-top: 0;
  }

  &.sub {
    padding-left: 100px;

    &:last-child {
      border-bottom: 1px solid #e3e5e7;
      padding-bottom: 10px;
    }
  }

  .comment-main {
    width: 100%;

    .user-avatar {
      position: absolute;
      left: 5px;
      top: 22px;
      width: 40px;
      height: 40px;

      &.sub {
        top: 25px;
        left: 68px;
        width: 24px;
        height: 24px;
      }

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .header-and-content {
      display: flex;
      flex-direction: column;

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
            color: #61666d;
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
        margin-top: 10px;
        line-height: 28px;
        word-break: break-word;

        &.second {
          margin: 0 0 0 10px;
        }

        .at-user {
          color: #409eff;
          font-weight: bold;
        }
      }
    }

    .comment-footer {
      display: flex;
      align-items: center;
      color: #9499a0;
      font-size: 13px;
      margin-top: 5px;

      > :not(:first-child) {
        margin-left: 20px;
      }

      .reply {
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }

    .commentbox {
      display: flex;
      align-items: center;
      margin-top: 20px;
      height: 50px;

      .sub-user-avatar {
        img {
          width: 48px;
          height: 48px;
          margin-right: 20px;
          border-radius: 50%;
        }
      }

      .edit {
        flex: 1 1 0;
        height: 100%;
        border-radius: 6px;
        font-size: 12px;
        color: #9499a0;
        background-color: #f1f2f3;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .editor {
        background-color: #fff;
      }
    }
  }
}
</style>
