import { defineStore } from 'pinia'
import type { Comment, CommentApiResponse, oneCommentApiResponse } from '@/types/api.ts'
import { get, post } from '@/utils/request.ts'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentList: [] as Comment[],
  }),
  getters: {},
  actions: {
    async getComment(vid: number) {
      await get<CommentApiResponse>(`/comment/get/all/${vid}`)
        .then((res) => {
          this.commentList = res.data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async sendComment(comment: Comment): Promise<Comment | null> {
      try {
        const res = await post<oneCommentApiResponse>(`/comment/send`, comment)
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
