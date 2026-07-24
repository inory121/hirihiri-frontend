import { get, post } from '@/utils/request'
import type {
  RecommendFeedDTO,
  RecommendEvent,
  RecommendFeedbackResponse,
  VideoApiResponse,
  VideoInfo,
} from '@/types/api'

export enum RECOMMEND_API {
  FEED = '/recommend/feed',
  EVENTS = '/recommend/events',
  REVOKE_DISLIKE = '/recommend/events/revoke-dislike',
  RELATED = '/recommend/related',
  NOT_INTERESTED = '/recommend/feedback/not-interested',
  BLOCK_AUTHOR = '/recommend/feedback/block-author',
}

export interface FeedParams {
  cursor?: string
  scene?: string
  limit?: number
}

/**
 * 获取推荐流
 */
export function getRecommendFeed(params?: FeedParams) {
  return get<{ code: number; message: string; data: RecommendFeedDTO }>(RECOMMEND_API.FEED, {
    params,
  })
}

/**
 * 批量上报推荐事件
 */
export function reportRecommendEvents(events: RecommendEvent[]) {
  return post<{ code: number; message: string; data: string }>(RECOMMEND_API.EVENTS, events)
}

/**
 * 撤销点踩事件（取消点踩时调用）
 */
export function revokeDislikeEvent(vid: number, requestId: string, scene: string) {
  return post<{ code: number; message: string; data: string }>(
    `${RECOMMEND_API.REVOKE_DISLIKE}/${vid}`,
    { requestId, scene },
  )
}

/**
 * 获取相关推荐视频
 */
export function getRelatedVideos(vid: number, limit?: number) {
  return get<VideoApiResponse>(`${RECOMMEND_API.RELATED}/${vid}`, {
    params: { limit },
  })
}

/**
 * 不感兴趣反馈
 */
export function notInterestedVideo(vid: number) {
  return post<RecommendFeedbackResponse>(`${RECOMMEND_API.NOT_INTERESTED}/${vid}`)
}

/**
 * 屏蔽作者反馈
 */
export function blockAuthor(uid: number) {
  return post<RecommendFeedbackResponse>(`${RECOMMEND_API.BLOCK_AUTHOR}/${uid}`)
}
