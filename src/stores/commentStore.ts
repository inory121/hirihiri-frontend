import { defineStore } from 'pinia'
import type { Comment, CommentApiResponse, oneCommentApiResponse } from '@/types/api.ts'
import { get, post } from '@/utils/request.ts'
import { COMMENT_API } from '@/api/comment'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentList: [] as Comment[],
    activeReplyCommentId:  null as number | null,
  }),
  getters: {},
  actions: {
    setActiveReplyCommentId(id: number | null) {
      this.activeReplyCommentId = id
    },
    async getComment(vid: number) {
      await get<CommentApiResponse>(`${COMMENT_API.VIDEO_COMMENT}/${vid}`)
        .then((res) => {
          this.commentList = Array.isArray(res.data) ? res.data : []
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async sendComment(comment: Comment): Promise<Comment | null> {
      try {
        const res = await post<oneCommentApiResponse>(COMMENT_API.SEND_COMMENT, comment)
        if (res.code === 200) {
          return res.data // 返回后端返回的 Comment 对象
        }
        return null
      } catch (error) {
        console.error('发送评论失败:', error)
        return null
      }
    },
  },
})
