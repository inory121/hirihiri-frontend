import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  getRecommendFeed,
  getRelatedVideos,
  reportRecommendEvents,
  revokeDislikeEvent,
  notInterestedVideo,
  blockAuthor,
  RECOMMEND_API,
} from '@/api/recommend'
import type { RecommendEvent, VideoInfo } from '@/types/api'

const MAX_PENDING_EVENTS = 30
const FLUSH_INTERVAL_MS = 5000
const FAILED_EVENTS_KEY = 'recommend_failed_events'
const MAX_FAILED_EVENTS = 200
let flushTimer: ReturnType<typeof setInterval> | null = null
let visibilityListenerRegistered = false

const loadFailedEvents = (): RecommendEvent[] => {
  try {
    const raw = localStorage.getItem(FAILED_EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveFailedEvents = (events: RecommendEvent[]) => {
  try {
    const toSave = events.slice(-MAX_FAILED_EVENTS)
    localStorage.setItem(FAILED_EVENTS_KEY, JSON.stringify(toSave))
  } catch {
  }
}

export const useRecommendStore = defineStore('recommend', {
  state: () => ({
    feedList: [] as VideoInfo[],
    feedLoading: false,
    feedHasMore: true,
    feedError: false,
    feedNextCursor: null as string | null,
    feedRequestId: null as string | null,
    pendingEvents: [] as RecommendEvent[],
    relatedList: [] as VideoInfo[],
    relatedLoading: false,
    impressionSet: new Set<string>(),
    clickSet: new Set<string>(),
    progressSet: new Set<string>(),
  }),

  actions: {
    async getFeed(refresh = false, limit = 20, scene = 'home') {
      if (this.feedLoading) return
      if (!refresh && !this.feedHasMore) return

      this.feedLoading = true
      try {
        const res = await getRecommendFeed({
          cursor: refresh ? undefined : (this.feedNextCursor ?? undefined),
          scene,
          limit,
        })
        if (res.code !== 200 || !res.data) {
          throw new Error(res.message || '获取推荐失败')
        }
        const { items, nextCursor, requestId } = res.data
        this.feedRequestId = requestId
        if (refresh) {
          this.feedList = items || []
          this.impressionSet.clear()
          this.clickSet.clear()
          this.progressSet.clear()
        } else {
          this.feedList.push(...(items || []))
        }
        this.feedNextCursor = nextCursor
        this.feedHasMore = !!nextCursor && items.length > 0
        this.feedError = false
        const newItems = refresh ? items : items?.slice(-limit)
        if (newItems && newItems.length > 0) {
          this.preloadDominantColors(newItems)
        }
      } catch (e) {
        console.error('获取推荐流失败:', e)
        this.feedError = true
        ElMessage.error('获取推荐失败')
      } finally {
        this.feedLoading = false
      }
    },

    async preloadDominantColors(list: VideoInfo[]) {
      const ColorThief = (await import('colorthief')).default
      await Promise.all(
        list.map(
          (videoInfo) =>
            new Promise<void>((resolve) => {
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.src = videoInfo.video.coverUrl
              img.onload = () => {
                try {
                  videoInfo.video.dominantColor = new ColorThief().getColor(img)
                } catch (e) {
                  videoInfo.video.dominantColor = [255, 255, 255]
                }
                resolve()
              }
              img.onerror = () => {
                videoInfo.video.dominantColor = [255, 255, 255]
                resolve()
              }
            }),
        ),
      )
    },

    enqueueEvent(event: RecommendEvent) {
      this.pendingEvents.push(event)
      if (this.pendingEvents.length === 1 && !flushTimer) {
        flushTimer = setInterval(() => {
          if (this.pendingEvents.length > 0) {
            this.flushEvents()
          }
        }, FLUSH_INTERVAL_MS)
      }
      if (this.pendingEvents.length >= MAX_PENDING_EVENTS) {
        this.flushEvents()
      }
    },

    async flushEvents() {
      if (flushTimer) {
        clearInterval(flushTimer)
        flushTimer = null
      }
      if (this.pendingEvents.length === 0) return
      const events = this.pendingEvents.splice(0, this.pendingEvents.length)
      console.log('[recommend] flushEvents:', events.length, 'events')
      try {
        const res = await reportRecommendEvents(events)
        if (res.code !== 200) {
          console.warn('事件上报失败:', res.message)
          this.saveFailed(events)
        }
      } catch (e) {
        console.error('事件上报请求失败:', e)
        this.saveFailed(events)
      }
    },

    flushEventsSync() {
      if (flushTimer) {
        clearInterval(flushTimer)
        flushTimer = null
      }
      if (this.pendingEvents.length === 0) return
      const events = this.pendingEvents.splice(0, this.pendingEvents.length)
      const uid = localStorage.getItem('hiri_uid')
      const baseUrl = `${import.meta.env.VITE_SERVER}${RECOMMEND_API.EVENTS}`
      const url = uid ? `${baseUrl}?uid=${encodeURIComponent(uid)}` : baseUrl
      const blob = new Blob([JSON.stringify(events)], { type: 'application/json' })
      const success = navigator.sendBeacon(url, blob)
      console.log('[recommend] flushEventsSync:', events.length, 'events, success:', success)
      if (!success) {
        this.saveFailed(events)
      }
    },

    saveFailed(events: RecommendEvent[]) {
      const existing = loadFailedEvents()
      const merged = [...existing, ...events]
      saveFailedEvents(merged)
      console.log('[recommend] saveFailed:', events.length, 'events, total failed:', merged.length)
    },

    async retryFailedEvents() {
      const failed = loadFailedEvents()
      if (failed.length === 0) return
      console.log('[recommend] retryFailedEvents:', failed.length, 'events')
      localStorage.removeItem(FAILED_EVENTS_KEY)
      try {
        const res = await reportRecommendEvents(failed)
        if (res.code !== 200) {
          console.warn('重试上报失败:', res.message)
          this.saveFailed(failed)
        } else {
          console.log('[recommend] retryFailedEvents: success')
        }
      } catch (e) {
        console.error('重试上报请求失败:', e)
        this.saveFailed(failed)
      }
    },

    reportImpression(vid: number, position: number, scene = 'home') {
      if (!this.feedRequestId) {
        console.warn('[recommend] reportImpression: feedRequestId is null')
        return
      }
      const key = `${this.feedRequestId}_${vid}_impression`
      if (this.impressionSet.has(key)) return
      this.impressionSet.add(key)

      const event = {
        eventId: crypto.randomUUID(),
        vid,
        eventType: 'impression' as const,
        requestId: this.feedRequestId,
        scene,
        position,
        eventTime: new Date().toISOString(),
      }
      this.enqueueEvent(event)
    },

    reportClick(vid: number, position: number, scene = 'home') {
      if (!this.feedRequestId) return
      const key = `${this.feedRequestId}_${vid}_click`
      if (this.clickSet.has(key)) return
      this.clickSet.add(key)

      this.enqueueEvent({
        eventId: crypto.randomUUID(),
        vid,
        eventType: 'click',
        requestId: this.feedRequestId,
        scene,
        position,
        eventTime: new Date().toISOString(),
      })
    },

    getRequestId(vid?: number): string | null {
      if (this.feedRequestId) return this.feedRequestId
      if (vid) return `direct_${vid}`
      return null
    },

    reportWatchProgress(vid: number, watchSeconds: number, progressRatio: number, scene = 'home') {
      const requestId = this.getRequestId(vid)
      if (!requestId) return
      const key = `${requestId}_${vid}_progress_${Math.floor(progressRatio * 100)}`
      if (this.progressSet.has(key)) return
      this.progressSet.add(key)

      this.enqueueEvent({
        eventId: crypto.randomUUID(),
        vid,
        eventType: 'watch_progress',
        requestId,
        scene,
        watchSeconds,
        progressRatio,
        eventTime: new Date().toISOString(),
      })
    },

    reportDislike(vid: number, scene = 'home') {
      const requestId = this.getRequestId(vid)
      if (!requestId) return
      this.enqueueEvent({
        eventId: crypto.randomUUID(),
        vid,
        eventType: 'dislike',
        requestId,
        scene,
        eventTime: new Date().toISOString(),
      })
    },

    async revokeDislike(vid: number, scene = 'home') {
      const requestId = this.getRequestId(vid)
      if (!requestId) return
      try {
        await revokeDislikeEvent(vid, requestId, scene)
      } catch (e) {
        console.error('撤销点踩事件失败:', e)
      }
    },

    async getRelated(vid: number, limit = 10) {
      this.relatedLoading = true
      try {
        const res = await getRelatedVideos(vid, limit)
        if (res.code === 200) {
          this.relatedList = res.data || []
          await this.preloadDominantColors(this.relatedList)
        } else {
          this.relatedList = []
        }
      } catch (e) {
        console.error('获取相关推荐失败:', e)
        this.relatedList = []
      } finally {
        this.relatedLoading = false
      }
    },

    async notInterested(vid: number) {
      try {
        const res = await notInterestedVideo(vid)
        if (res.code === 200) {
          ElMessage.success(res.data || '已标记不感兴趣')
          this.feedList = this.feedList.filter((item) => item.video.vid !== vid)
          this.relatedList = this.relatedList.filter((item) => item.video.vid !== vid)
          return true
        }
        ElMessage.error(res.message || '操作失败')
        return false
      } catch (e) {
        console.error('标记不感兴趣失败:', e)
        ElMessage.error('操作失败')
        return false
      }
    },

    async blockAuthor(uid: number) {
      try {
        const res = await blockAuthor(uid)
        if (res.code === 200) {
          ElMessage.success(res.data || '已屏蔽该作者')
          this.feedList = this.feedList.filter((item) => item.video.uid !== uid)
          this.relatedList = this.relatedList.filter((item) => item.video.uid !== uid)
          return true
        }
        ElMessage.error(res.message || '操作失败')
        return false
      } catch (e) {
        console.error('屏蔽作者失败:', e)
        ElMessage.error('操作失败')
        return false
      }
    },

    initPageLifecycleListeners() {
      if (visibilityListenerRegistered) return
      visibilityListenerRegistered = true

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          this.flushEventsSync()
        }
      }

      const handlePageHide = () => {
        this.flushEventsSync()
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('pagehide', handlePageHide)
    },
  },
})
