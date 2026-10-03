import { defineStore } from 'pinia'
import { get, post, del } from '@/utils/request'
import { MESSAGE_API } from '@/api/message'
import type {
  MessageUnread,
  MessageSession,
  MessagePrivateMessage,
  MessageNotice,
  MessageUnreadApiResponse,
  MessageSessionListApiResponse,
  MessageSessionItemApiResponse,
  MessagePrivateListApiResponse,
  MessagePrivateItemApiResponse,
  MessageNoticeListApiResponse,
} from '@/types/api'

// 全局消息序号，用于生成唯一 clientMessageId
let _msgSeq = 0
function genClientMessageId(): string {
  _msgSeq++
  return `cmsg_${Date.now()}_${_msgSeq}_${Math.random().toString(36).slice(2, 7)}`
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    // 未读统计
    unread: { totalUnread: 0, privateUnread: 0, strangerUnread: 0, replyUnread: 0, atUnread: 0, likeUnread: 0, systemUnread: 0 } as MessageUnread,

    // 会话列表（已关注用户）
    followSessions: [] as MessageSession[],
    followSessionsLoading: false,

    // 会话列表（陌生人）
    strangerSessions: [] as MessageSession[],
    strangerSessionsLoading: false,

    // 当前打开的会话
    currentSessionId: null as number | null,
    currentSession: null as MessageSession | null,
    currentMessages: [] as MessagePrivateMessage[],
    currentMessagesLoading: false,
    currentMessagePage: 1,

    // 按会话缓存消息
    messagesBySession: {} as Record<number, MessagePrivateMessage[]>,

    // 通知列表
    notices: [] as MessageNotice[],
    noticesLoading: false,
    currentNoticeType: '' as string,

    // WebSocket 状态
    wsInstance: null as WebSocket | null,
    wsConnected: false,
    wsReconnecting: false,
    wsPingIntervalId: null as ReturnType<typeof setInterval> | null,
    wsReconnectTimerId: null as ReturnType<typeof setTimeout> | null,
    wsReconnectAttempts: 0,
    wsLastDisconnectTime: 0 as number,
    isFirstConnection: true,   // 首次建连标记：onopen 时 App.vue 已拉取，跳过重复；重连后置 false 触发补拉

    // 已打开会话的已读请求尚未完成时，忽略该会话引发的旧未读推送。
    pendingReadSessions: {} as Record<number, boolean>,

    // 快速发送目标（从 UserHoverCard 点击"发消息"时设置）
    pendingTargetUid: null as number | null,
  }),

  getters: {
    allSessions(state): MessageSession[] {
      return [...state.followSessions, ...state.strangerSessions]
    },
    totalUnreadCount(state): number {
      return state.unread.totalUnread
    },
  },

  actions: {
    // ==================== 消息身份生成 ====================

    genClientMessageId(): string {
      return genClientMessageId()
    },

    // ==================== WebSocket ====================

    connectWebSocket() {
      const token = localStorage.getItem('hiri_token')
      if (!token) return

      if (this.wsInstance && this.wsInstance.readyState !== WebSocket.CLOSED) {
        return
      }

      try {
        const baseServer = (import.meta.env.VITE_SERVER as string) || 'http://localhost:11451/api'
        const wsUrl = baseServer
          .replace(/^http/, 'ws')
          .replace(/\/api$/, '')
        const url = `${wsUrl}/ws/message?token=${encodeURIComponent(token)}`

        this.wsInstance = new WebSocket(url)

        this.wsInstance.onopen = () => {
          this.wsConnected = true
          this.wsReconnectAttempts = 0
          this.startHeartbeat()
          // 首次建连时 App.vue startLoggedInInit 已拉取未读/会话，无需重复；
          // 仅在重连（非首次）时才补拉，避免初始化阶段出现双倍请求。
          if (!this.isFirstConnection) {
            void this.fetchUnreadSummary()
            void this.fetchSessions()
          }
          this.isFirstConnection = false
        }

        this.wsInstance.onmessage = (event) => {
          try {
            const envelope = JSON.parse(event.data)
            this.handleSocketMessage(envelope)
          } catch {
            // ignore parse errors
          }
        }

        this.wsInstance.onclose = (event) => {
          this.wsConnected = false
          this.stopHeartbeat()
          // 仅非正常关闭时重连
          if (event.code !== 1000 && event.code !== 1001) {
            this.scheduleReconnect()
          }
        }

        this.wsInstance.onerror = () => {
          // 不主动 close，让浏览器自然触发 onclose
        }
      } catch {
        this.scheduleReconnect()
      }
    },

    disconnectWebSocket() {
      this.stopHeartbeat()
      if (this.wsReconnectTimerId) {
        clearTimeout(this.wsReconnectTimerId)
        this.wsReconnectTimerId = null
      }
      if (this.wsInstance) {
        this.wsInstance.onclose = null
        this.wsInstance.close(1000)
        this.wsInstance = null
      }
      this.wsConnected = false
    },

    startHeartbeat() {
      this.stopHeartbeat()
      this.wsPingIntervalId = setInterval(() => {
        if (this.wsInstance?.readyState === WebSocket.OPEN) {
          this.wsInstance.send(JSON.stringify({ type: 'PING' }))
        }
      }, 30000)
    },

    stopHeartbeat() {
      if (this.wsPingIntervalId) {
        clearInterval(this.wsPingIntervalId)
        this.wsPingIntervalId = null
      }
    },

    scheduleReconnect() {
      if (this.wsReconnecting) return
      if (this.wsReconnectAttempts >= 5) return
      const now = Date.now()
      if (this.wsLastDisconnectTime > 0 && now - this.wsLastDisconnectTime < 3000) {
        return
      }
      this.wsLastDisconnectTime = now
      this.wsReconnecting = true
      const delay = Math.min(30000, 2000 * Math.pow(2, this.wsReconnectAttempts))
      this.wsReconnectTimerId = setTimeout(() => {
        this.wsReconnecting = false
        this.wsReconnectAttempts++
        const token = localStorage.getItem('hiri_token')
        if (token) {
          this.connectWebSocket()
        }
      }, delay)
    },
// ==================== 消息合并（核心） ====================

    /**
     * 统一的消息合并入口：HTTP 返回和 WS 推送都走这里
     * - 按 clientMessageId 精确替换乐观消息
     * - 按服务端 id 去重（id > 0）
     * - 同时更新 messagesBySession 缓存和 currentMessages
     */
    mergeIncomingMessage(msg: MessagePrivateMessage, clientMessageId?: string) {
      const sid = msg.sessionId
      if (!sid) return

      // 会话预览与消息列表独立更新。即使该消息已被接口拉取进缓存、
      // 后续 WebSocket 因去重提前返回，也必须刷新 ses-preview。
      this.updateSessionPreviewFromMessage(msg)

      // 确保缓存存在
      if (!this.messagesBySession[sid]) {
        this.messagesBySession[sid] = []
      }
      const cache = this.messagesBySession[sid]

      // 1) 按 clientMessageId 替换乐观消息
      if (clientMessageId) {
        const optIdx = cache.findIndex((m) => m.clientMessageId === clientMessageId)
        if (optIdx >= 0) {
          // 保留前端本地字段，合并服务端数据
          const existing = cache[optIdx]
          cache[optIdx] = {
            ...existing,
            ...msg,
            clientMessageId: existing.clientMessageId,
            status: 'sent',
          }
          // 同步到当前会话视图
          this._syncCacheToCurrent(sid)
          return
        }
      }

      // 2) 按服务端 id 去重（id > 0）
      if (msg.id > 0 && cache.some((m) => m.id === msg.id)) {
        return
      }

      // 3) 新增消息
      cache.push(msg)
      this._syncCacheToCurrent(sid)
    },

    /** 即使 SESSION_UPDATED 延迟或丢失，也用消息本身更新会话预览。 */
    updateSessionPreviewFromMessage(msg: MessagePrivateMessage) {
      const apply = (session: MessageSession) => {
        session.lastMessage = msg.content
        session.lastMessageTime = msg.createTime
      }
      const session = this.allSessions.find((item) => item.sessionId === msg.sessionId)
      if (session) apply(session)
      if (this.currentSessionId === msg.sessionId && this.currentSession) apply(this.currentSession)
    },

    /**
     * 合并接口拉取的历史消息和已由 WebSocket 写入的缓存。
     * 请求在飞行期间收到的实时消息不能被旧 HTTP 响应覆盖，否则会出现
     * “必须重新点击会话才能看到新消息”的现象。
     */
    mergeFetchedMessages(sessionId: number, fetched: MessagePrivateMessage[], pageNum: number) {
      const cached = this.messagesBySession[sessionId] || []
      const merged = pageNum === 1 ? [...fetched, ...cached] : [...fetched, ...cached]
      const seenServerIds = new Set<number>()
      const seenClientIds = new Set<string>()

      const unique = merged.filter((msg) => {
        if (msg.id > 0) {
          if (seenServerIds.has(msg.id)) return false
          seenServerIds.add(msg.id)
          return true
        }
        if (msg.clientMessageId) {
          if (seenClientIds.has(msg.clientMessageId)) return false
          seenClientIds.add(msg.clientMessageId)
        }
        return true
      })

      unique.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime())
      this.messagesBySession[sessionId] = unique
      // 接口补拉同样要刷新中间会话行的 ses-preview；否则右侧已出现新消息，
      // 但预览只能等用户点击“我的消息”重新请求会话列表才更新。
      const latestMessage = unique[unique.length - 1]
      if (latestMessage) this.updateSessionPreviewFromMessage(latestMessage)
      this._syncCacheToCurrent(sessionId)
    },

    /** 将缓存同步到 currentMessages（如果当前会话匹配） */
    _syncCacheToCurrent(sessionId: number) {
      if (sessionId === this.currentSessionId) {
        this.currentMessages = [...(this.messagesBySession[sessionId] || [])]
      }
    },

    // ==================== 会话列表合并（防竞态） ====================

    /**
     * 按 lastMessageTime 做版本比较，防止旧 HTTP 响应覆盖 WS 新数据
     */
    upsertSessionList(sessions: MessageSession[], listType: 'follow' | 'stranger') {
      const targetList = listType === 'follow' ? this.followSessions : this.strangerSessions
      const existingMap = new Map(targetList.map((s) => [s.sessionId, s]))

      for (const incoming of sessions) {
        const normalizedIncoming = incoming.sessionId === this.currentSessionId
          ? { ...incoming, unreadCount: 0 }
          : incoming
        const existing = existingMap.get(normalizedIncoming.sessionId)
        if (!existing) {
          existingMap.set(normalizedIncoming.sessionId, normalizedIncoming)
        } else if (normalizedIncoming.lastMessageTime && existing.lastMessageTime) {
          if (new Date(normalizedIncoming.lastMessageTime).getTime() >= new Date(existing.lastMessageTime).getTime()) {
            Object.assign(existing, normalizedIncoming)
          }
        } else if (normalizedIncoming.lastMessageTime) {
          Object.assign(existing, normalizedIncoming)
        }
        // 如果 incoming 没有 lastMessageTime，保留 existing（incoming 是旧数据）
      }

      // 保持原有顺序，追加新会话
      const updated = [...existingMap.values()]
      if (listType === 'follow') {
        this.followSessions = updated
      } else {
        this.strangerSessions = updated
      }
    },

    /** 单个会话更新（WS 用），带版本比较 */
    upsertSession(session: MessageSession) {
      // 正在查看的会话收到新消息即视为已读；即使 SESSION_UPDATED 晚于已读请求到达，
      // 也不能把红点重新显示出来。
      if (session.sessionId === this.currentSessionId) {
        session = { ...session, unreadCount: 0 }
      }
      const list = session.following ? this.followSessions : this.strangerSessions
      const idx = list.findIndex((s) => s.sessionId === session.sessionId)
      if (idx >= 0) {
        const existing = list[idx]
        if (session.lastMessageTime && existing.lastMessageTime) {
          if (new Date(session.lastMessageTime).getTime() >= new Date(existing.lastMessageTime).getTime()) {
            list[idx] = { ...existing, ...session }
          }
        } else {
          list[idx] = { ...existing, ...session }
        }
      } else {
        list.unshift(session)
      }
    },

    /** 发消息后本地快速更新当前会话（不等待网络） */
    updateCurrentSessionLocally(content: string) {
      if (this.currentSession) {
        this.currentSession.lastMessage = content
        this.currentSession.lastMessageTime = new Date().toISOString()
        // 同步更新列表中的同一会话
        const list = this.currentSession.following ? this.followSessions : this.strangerSessions
        const sidx = list.findIndex((s) => s.sessionId === this.currentSession!.sessionId)
        if (sidx >= 0) {
          list[sidx] = { ...list[sidx], lastMessage: content, lastMessageTime: new Date().toISOString() }
        }
      }
    },

    // ==================== WS 消息处理 ====================

    handleSocketMessage(envelope: { type: string; data: unknown }) {
      switch (envelope.type) {
        case 'PRIVATE_MESSAGE': {
          const msg = envelope.data as MessagePrivateMessage
          // 统一走 merge，不再区分当前会话
          this.mergeIncomingMessage(msg)
          // 当前正在查看对方会话时，收到的消息立即确认已读。
          const currentUid = Number(localStorage.getItem('hiri_uid'))
          if (msg.sessionId === this.currentSessionId && msg.receiverUid === currentUid) {
            void this.markSessionRead(msg.sessionId)
          }
          break
        }
        case 'SESSION_UPDATED': {
          const updated = envelope.data as MessageSession
          this.upsertSession(updated)
          break
        }
        case 'NOTICE_UPDATED': {
          const notice = envelope.data as MessageNotice
          this.notices.unshift(notice)
          break
        }
        case 'UNREAD_UPDATED': {
          // 当前会话正在提交已读，服务端先前推送的汇总值已经过期，不能重新点亮红点。
          if (this.currentSessionId && this.pendingReadSessions[this.currentSessionId]) break
          this.unread = envelope.data as MessageUnread
          break
        }
        case 'PONG':
          break
      }
    },

    // ==================== API 请求 ====================

    async fetchUnreadSummary() {
      try {
        const res = await get<MessageUnreadApiResponse>(MESSAGE_API.UNREAD)
        if (res.code === 200) {
          this.unread = res.data
        }
      } catch {
        // ignore
      }
    },

    async fetchSessions() {
      await Promise.all([this.fetchFollowSessions(), this.fetchStrangerSessions()])
    },

    async fetchFollowSessions() {
      this.followSessionsLoading = true
      try {
        const res = await get<MessageSessionListApiResponse>(MESSAGE_API.SESSIONS)
        if (res.code === 200) {
          this.upsertSessionList(res.data, 'follow')
        }
      } catch {
        // ignore
      } finally {
        this.followSessionsLoading = false
      }
    },

    async fetchStrangerSessions() {
      this.strangerSessionsLoading = true
      try {
        const res = await get<MessageSessionListApiResponse>(MESSAGE_API.SESSIONS, {
          params: { stranger: true },
        })
        if (res.code === 200) {
          this.upsertSessionList(res.data, 'stranger')
        }
      } catch {
        // ignore
      } finally {
        this.strangerSessionsLoading = false
      }
    },

    async createOrGetSession(targetUid: number): Promise<MessageSession | null> {
      try {
        const res = await post<MessageSessionItemApiResponse>(
          `${MESSAGE_API.CREATE_SESSION}/${targetUid}`,
        )
        if (res.code === 200) {
          return res.data
        }
      } catch {
        // ignore
      }
      return null
    },

    async fetchSessionMessages(sessionId: number, pageNum = 1, pageSize = 30) {
      this.currentMessagesLoading = true
      try {
        const res = await get<MessagePrivateListApiResponse>(
          `${MESSAGE_API.SESSION_MESSAGES}/${sessionId}/messages`,
          { params: { pageNum, pageSize } },
        )
        if (res.code === 200) {
          // 不能直接覆盖缓存：请求期间可能已经收到实时消息。
          this.mergeFetchedMessages(sessionId, res.data, pageNum)
          this.currentMessagePage = pageNum
          return res.data.length === pageSize
        }
      } catch {
        // ignore
      } finally {
        this.currentMessagesLoading = false
      }
      return false
    },

    async loadMoreMessages() {
      if (this.currentSessionId) {
        return await this.fetchSessionMessages(this.currentSessionId, this.currentMessagePage + 1)
      }
      return false
    },

    async sendMessage(
      targetUid: number,
      content: string,
      clientMessageId?: string,
    ): Promise<{ ok: boolean; message: string; data: MessagePrivateMessage | null }> {
      try {
        const res = await post<MessagePrivateItemApiResponse>(MESSAGE_API.SEND_PRIVATE, {
          targetUid,
          content,
        })
        if (res.code === 200) {
          const msg = res.data
          // 统一走 merge，用 clientMessageId 精确替换乐观消息
          this.mergeIncomingMessage(msg, clientMessageId)
          return { ok: true, message: res.message || '发送成功', data: msg }
        }
        // 业务失败（如仍被拉黑）：把后端原因透出，由调用方标记失败并提示
        return { ok: false, message: res.message || '发送失败', data: null }
      } catch {
        return { ok: false, message: '发送失败，请稍后重试', data: null }
      }
    },

    async markSessionRead(sessionId: number) {
      if (this.pendingReadSessions[sessionId]) return
      this.pendingReadSessions[sessionId] = true
      // 先清掉本地会话红点，避免等待网络往返期间闪出未读状态。
      const session = this.allSessions.find((item) => item.sessionId === sessionId)
      const unreadCount = session?.unreadCount ?? 0
      if (session) session.unreadCount = 0
      if (this.currentSessionId === sessionId && this.currentSession) {
        this.currentSession.unreadCount = 0
      }
      if (unreadCount > 0) {
        if (session?.following) {
          this.unread.privateUnread = Math.max(0, this.unread.privateUnread - unreadCount)
        } else {
          this.unread.strangerUnread = Math.max(0, this.unread.strangerUnread - unreadCount)
        }
        this.unread.totalUnread = Math.max(0, this.unread.totalUnread - unreadCount)
      }
      try {
        await post(`${MESSAGE_API.SESSION_READ}/${sessionId}/read`)
        await this.fetchUnreadSummary()
      } catch {
        // ignore
      } finally {
        delete this.pendingReadSessions[sessionId]
      }
    },

    async openSession(targetUid: number) {
      const session = await this.createOrGetSession(targetUid)
      if (session) {
        // 确保会话进入正确的列表（已关注/未关注人），使左侧中间列表能显示并高亮。
        this.upsertSession(session)
        this.currentSessionId = session.sessionId
        this.currentSession = session
        this._syncCacheToCurrent(session.sessionId)
        this.currentMessagePage = 1
        await this.fetchSessionMessages(session.sessionId)
        await this.markSessionRead(session.sessionId)
        await this.fetchUnreadSummary()
      }
      return session
    },

    /** 删除会话 */
    async deleteSession(sessionId: number) {
      try {
        const res = await del<{ code: number }>(`${MESSAGE_API.DELETE_SESSION}/${sessionId}/delete`)
        if (res.code === 200) {
          // 从列表中移除
          this.followSessions = this.followSessions.filter((s) => s.sessionId !== sessionId)
          this.strangerSessions = this.strangerSessions.filter((s) => s.sessionId !== sessionId)
          // 清理缓存
          delete this.messagesBySession[sessionId]
          // 如果删除的是当前会话，清空当前状态
          if (this.currentSessionId === sessionId) {
            this.currentSessionId = null
            this.currentSession = null
            this.currentMessages = []
          }
          await this.fetchUnreadSummary()
        }
      } catch {
        // ignore
      }
    },

    // ==================== 通知 ====================

    async fetchNotices(noticeType = '', pageNum = 1, pageSize = 20) {
      this.noticesLoading = true
      this.currentNoticeType = noticeType
      try {
        const res = await get<MessageNoticeListApiResponse>(MESSAGE_API.NOTICES, {
          params: {
            type: noticeType || undefined,
            pageNum,
            pageSize,
          },
        })
        if (res.code === 200) {
          if (pageNum === 1) {
            this.notices = res.data
          } else {
            this.notices.push(...res.data)
          }
        }
      } catch {
        // ignore
      } finally {
        this.noticesLoading = false
      }
    },

    async markNoticeRead(noticeId: number) {
      try {
        await post(`${MESSAGE_API.NOTICE_READ}/${noticeId}/read`)
        const notice = this.notices.find((n) => n.id === noticeId)
        if (notice) notice.isRead = 1
        await this.fetchUnreadSummary()
      } catch {
        // ignore
      }
    },

    async markAllNoticesRead(noticeType = '') {
      try {
        await post(MESSAGE_API.NOTICE_READ_ALL, undefined, {
          params: { type: noticeType || undefined },
        })
        for (const n of this.notices) {
          n.isRead = 1
        }
        await this.fetchUnreadSummary()
      } catch {
        // ignore
      }
    },

    /** 删除单条通知（调用后端真实删除，并同步本地列表与未读汇总） */
    async deleteNotice(noticeId: number) {
      try {
        const res = await del<{ code: number }>(`${MESSAGE_API.NOTICE_DELETE}/${noticeId}/delete`)
        if (res.code === 200) {
          this.notices = this.notices.filter((n) => n.id !== noticeId)
          await this.fetchUnreadSummary()
        }
      } catch {
        // ignore
      }
    },
  },
})
