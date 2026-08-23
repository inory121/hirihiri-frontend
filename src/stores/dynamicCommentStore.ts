import { defineStore } from 'pinia'
import type { Comment, CommentApiResponse, oneCommentApiResponse } from '@/types/api.ts'
import { get, post, del } from '@/utils/request.ts'
import { COMMENT_API } from '@/api/comment'
import { useUserStore } from '@/stores/userStore'

function updateCommentInTree(comments: Comment[], commentId: number, updater: (comment: Comment) => void): boolean {
  for (const comment of comments) {
    if (comment.id === commentId) {
      updater(comment)
      return true
    }
    if (comment.replies?.length && updateCommentInTree(comment.replies, commentId, updater)) return true
  }
  return false
}

export const useDynamicCommentStore = defineStore('dynamicComment', {
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
     * 加载动态评论（第一页或重置），按 dynamicId 过滤
     */
    async getComments(dynamicId: number, sort?: 'hot' | 'new') {
      this.loading = true
      this.currentPage = 1
      const currentSort = sort || this.sort
      try {
        const res = await get<CommentApiResponse>(
          `${COMMENT_API.DYNAMIC_COMMENT}/${dynamicId}?sort=${currentSort}&page=1&pageSize=${this.pageSize}`
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
     * 加载更多动态评论（下一页）
     */
    async loadMoreComments(dynamicId: number): Promise<boolean> {
      if (!this.hasMore || this.loading) return false
      this.loading = true
      const nextPage = this.currentPage + 1
      try {
        const res = await get<CommentApiResponse>(
          `${COMMENT_API.DYNAMIC_COMMENT}/${dynamicId}?sort=${this.sort}&page=${nextPage}&pageSize=${this.pageSize}`
        )
        const pageData = res.data
        // 追加到现有列表（去重：置顶楼层可能与分页数据重复）
        const existingIds = new Set(this.commentList.map((c) => c.id))
        const newComments = (pageData.comments ?? []).filter((c) => !existingIds.has(c.id))
        this.commentList = [...this.commentList, ...newComments]
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
    /**
     * 发送动态评论。dynamicId 必填，parentId/rootId 可选（回复时传入）
     */
    async sendComment(dynamicId: number, content: string, parentId?: number, rootId?: number, toUserId?: number): Promise<Comment | null> {
      try {
        const payload: Comment = {
          id: undefined,
          vid: 0, // 动态评论不填 vid
          dynamicId,
          uid: useUserStore().user?.uid ?? 0,
          content,
          parentId: parentId ?? 0,
          rootId: rootId ?? 0,
          toUserId: toUserId ?? 0,
          like: 0,
          dislike: 0,
          isTop: 0,
          isDeleted: 0,
          createTime: '',
        }
        const res = await post<oneCommentApiResponse>(COMMENT_API.SEND_COMMENT, payload)
        if (res.code === 200) {
          return res.data
        }
        return null
      } catch (error) {
        console.error('发送评论失败:', error)
        return null
      }
    },
    async toggleLike(commentId: number) {
      if (!useUserStore().isLogin) return false
      const res = await post<{ code: number }>(`${COMMENT_API.TOGGLE_LIKE}/${commentId}`)
      if (res.code !== 200) return false
      updateCommentInTree(this.commentList, commentId, (comment) => {
        const liked = !comment.liked
        comment.liked = liked
        comment.like = Math.max(0, (comment.like || 0) + (liked ? 1 : -1))
        if (liked && comment.disliked) {
          comment.disliked = false
          comment.dislike = Math.max(0, (comment.dislike || 0) - 1)
        }
      })
      return true
    },
    async toggleDislike(commentId: number) {
      if (!useUserStore().isLogin) return false
      const res = await post<{ code: number }>(`${COMMENT_API.TOGGLE_DISLIKE}/${commentId}`)
      if (res.code !== 200) return false
      updateCommentInTree(this.commentList, commentId, (comment) => {
        const disliked = !comment.disliked
        comment.disliked = disliked
        comment.dislike = Math.max(0, (comment.dislike || 0) + (disliked ? 1 : -1))
        if (disliked && comment.liked) {
          comment.liked = false
          comment.like = Math.max(0, (comment.like || 0) - 1)
        }
      })
      return true
    },
    /**
     * 删除评论（软删除），成功后从本地列表移除
     */
    async deleteComment(commentId: number): Promise<boolean> {
      if (!useUserStore().isLogin) return false
      try {
        const res = await del<{ code: number }>(`${COMMENT_API.DELETE_COMMENT}/${commentId}`)
        if (res.code !== 200) return false
        let removedCount = 0
        const removeFromTree = (list: Comment[]): boolean => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].id === commentId) {
              removedCount = 1 + (list[i].replies?.length || 0)
              list.splice(i, 1)
              return true
            }
            if (list[i].replies?.length && removeFromTree(list[i].replies!)) {
              removedCount = 1
              return true
            }
          }
          return false
        }
        removeFromTree(this.commentList)
        this.total = Math.max(0, this.total - removedCount)
        return true
      } catch (err) {
        console.error('删除评论失败:', err)
        return false
      }
    },
    /**
     * 置顶/取消置顶评论，成功后更新本地评论的 isTop 并把置顶评论移到列表最前
     */
    async toggleCommentTop(commentId: number, top: boolean): Promise<boolean> {
      if (!useUserStore().isLogin) return false
      try {
        const res = await post<{ code: number }>(`${COMMENT_API.SET_TOP}/${commentId}/${top}`)
        if (res.code !== 200) return false
        if (top) {
          this.commentList.forEach((c) => {
            if (c.id !== commentId) c.isTop = 0
          })
        }
        updateCommentInTree(this.commentList, commentId, (comment) => {
          comment.isTop = top ? 1 : 0
        })
        if (top) {
          const idx = this.commentList.findIndex((c) => c.id === commentId)
          if (idx > 0) {
            const [c] = this.commentList.splice(idx, 1)
            this.commentList.unshift(c)
          }
        }
        return true
      } catch (err) {
        console.error('置顶评论失败:', err)
        return false
      }
    },
  },
})
