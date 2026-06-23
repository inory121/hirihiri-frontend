import { defineStore } from 'pinia'
import type { Comment, CommentApiResponse, oneCommentApiResponse } from '@/types/api.ts'
import { get, post } from '@/utils/request.ts'
import { COMMENT_API } from '@/api/comment'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentList: [] as Comment[],
    activeReplyCommentId: null as number | null,
    sort: 'hot' as 'hot' | 'new',
    // 分页状态
    currentPage: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    loading: false,
  }),
  getters: {},
  actions: {
    setActiveReplyCommentId(id: number | null) {
      this.activeReplyCommentId = id
    },
    setSort(sort: 'hot' | 'new') {
      this.sort = sort
    },
    /**
     * 加载评论（第一页或重置）
     */
    async getComment(vid: number, sort?: 'hot' | 'new') {
      this.loading = true
      this.currentPage = 1
      const currentSort = sort || this.sort
      try {
        const res = await get<CommentApiResponse>(
          `${COMMENT_API.VIDEO_COMMENT}/${vid}?sort=${currentSort}&page=1&pageSize=${this.pageSize}`
        )
        const pageData = res.data
        this.commentList = pageData.comments ?? []
        this.total = pageData.total ?? 0
        this.hasMore = pageData.hasMore ?? false
        this.currentPage = 1
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    /**
     * 加载更多评论（下一页）
     */
    async loadMoreComments(vid: number): Promise<boolean> {
      if (!this.hasMore || this.loading) return false
      this.loading = true
      const nextPage = this.currentPage + 1
      try {
        const res = await get<CommentApiResponse>(
          `${COMMENT_API.VIDEO_COMMENT}/${vid}?sort=${this.sort}&page=${nextPage}&pageSize=${this.pageSize}`
        )
        const pageData = res.data
        // 追加到现有列表
        this.commentList = [...this.commentList, ...(pageData.comments ?? [])]
        this.total = pageData.total ?? this.total
        this.hasMore = pageData.hasMore ?? false
        this.currentPage = nextPage
        return true
      } catch (err) {
        console.log(err)
        return false
      } finally {
        this.loading = false
      }
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
