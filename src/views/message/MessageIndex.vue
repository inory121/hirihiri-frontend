<template>
  <div style="min-height: 64px" class="hiri-header__bar">
    <HeaderBar/>
  </div>
  <div class="message-page">
    <!-- 左下角云朵装饰 -->
    <svg class="bg-clouds" viewBox="0 0 460 240" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ffffff" opacity="0.8">
        <ellipse cx="90" cy="200" rx="70" ry="34"/>
        <ellipse cx="155" cy="178" rx="62" ry="42"/>
        <ellipse cx="225" cy="206" rx="72" ry="30"/>
        <ellipse cx="40" cy="158" rx="34" ry="22"/>
        <ellipse cx="310" cy="228" rx="84" ry="26"/>
        <ellipse cx="380" cy="198" rx="42" ry="20"/>
      </g>
    </svg>

    <div class="msg-card">
      <!-- 顶部标题栏 -->
      <header class="card-head">
        <div class="head-logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          <span>消息中心</span>
        </div>
        <div class="head-title">
          <template v-if="currentMode === 'like' && likeDetailBiz">
            <span class="crumb-link" @click="router.push('/like')">收到的赞</span>
            <span class="crumb-sep">&gt;</span>
            <span>点赞详情</span>
          </template>
          <template v-else>{{ listPanelTitle }}</template>
        </div>
      </header>

      <!-- 左侧导航 -->
      <aside class="msg-side">
        <ul class="side-menu">
          <li
            v-for="item in navItems"
            :key="item.key"
            class="side-item"
            :class="{ active: currentMode === item.key }"
            @click="switchNav(item.key)"
          >
            <i class="item-dot"></i>
            <span class="item-label">{{ item.label }}</span>
            <em v-if="item.badge > 0" class="item-badge">{{
                item.badge > 99 ? '99+' : item.badge
              }}</em>
          </li>
        </ul>
        <div class="side-footer">
          <span class="side-item setting" @click="handleSetting">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span class="item-label">消息设置</span>
          </span>
        </div>
      </aside>

      <!-- 中间列表：仅“我的消息”需要展示会话列表；其他模式直接由右侧展示通知 -->
      <section v-if="currentMode === 'myMessages'" class="msg-list">
        <!-- 面包屑：始终显示“最近消息”根级；未关注人上下文时追加“未关注的人” -->
        <div class="list-breadcrumb">
          <span
            v-if="showStrangerSessions"
            class="breadcrumb-link"
            @click="backToRecentMessages"
          >最近消息</span>
          <span v-else class="breadcrumb-current">最近消息</span>

          <template v-if="showStrangerSessions">
            <span class="breadcrumb-sep">&gt;</span>
            <!-- 在聊天会话中，“未关注的人”可点击回到未关注人列表，保留面包屑 -->
            <span
              v-if="currentSession && currentSession.following === false"
              class="breadcrumb-link"
              @click="goToStrangerList"
            >未关注的人</span>
            <span v-else class="breadcrumb-current">未关注的人</span>
          </template>
        </div>

        <!-- 私信会话列表 -->
        <div class="list-scroll">
          <template v-if="!showStrangerSessions">
            <div
              v-for="session in followSessionList"
              :key="session.sessionId"
              class="session-row"
              :class="{ active: currentSessionId === session.sessionId }"
              @click="goToSession(session)"
            >
              <button class="ses-delete-btn" title="删除会话" @click.stop="deleteSession(session)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <img class="ses-avatar" :src="session.peerUser?.avatar || defaultAvatar" alt=""/>
              <div class="ses-body">
                <p class="ses-name">{{ getUserDisplayName(session.peerUser) }}</p>
                <p class="ses-preview">{{ session.lastMessage || '暂无消息' }}</p>
              </div>
              <em v-if="session.unreadCount > 0 && currentSessionId !== session.sessionId"
                  class="ses-badge">{{
                  session.unreadCount > 99 ? '99+' : session.unreadCount
                }}</em>
            </div>
            <div
              class="session-row"
              v-if="strangerSessionList.length > 0"
              @click="router.push('/message/unfollow')"
            >
              <div class="stranger-entry-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="1.5"/>
                  <path d="m4 7 8 6 8-6"/>
                </svg>
              </div>
              <div class="ses-body">
                <p class="ses-name">未关注人消息</p>
                <p class="ses-preview">
                  <template v-if="unread.strangerUnread > 0">[{{
                      unread.strangerUnread
                    }}条]
                  </template>
                  {{
                    getUserDisplayName(strangerSessionList[0]?.peerUser, '') || '有新的陌生人消息'
                  }}：{{ strangerSessionList[0]?.lastMessage || '' }}
                </p>
              </div>
              <i v-if="unread.strangerUnread > 0" class="stranger-unread-dot"
                 aria-label="有未读消息"></i>
            </div>
          </template>
          <template v-else>
            <div
              v-for="session in strangerSessionList"
              :key="session.sessionId"
              class="session-row"
              :class="{ active: currentSessionId === session.sessionId }"
              @click="goToSession(session)"
            >
              <button class="ses-delete-btn" title="删除会话" @click.stop="deleteSession(session)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <img class="ses-avatar" :src="session.peerUser?.avatar || defaultAvatar" alt=""/>
              <div class="ses-body">
                <p class="ses-name">{{ getUserDisplayName(session.peerUser) }}</p>
                <p class="ses-preview">{{ session.lastMessage || '暂无消息' }}</p>
              </div>
              <em v-if="session.unreadCount > 0 && currentSessionId !== session.sessionId"
                  class="ses-badge">{{
                  session.unreadCount > 99 ? '99+' : session.unreadCount
                }}</em>
            </div>
          </template>
          <div
            v-if="!sessionsLoading && !showStrangerSessions && followSessionList.length === 0 && strangerSessionList.length === 0"
            class="list-empty">暂无会话
          </div>
          <div v-if="!sessionsLoading && showStrangerSessions && strangerSessionList.length === 0"
               class="list-empty">暂无未关注人消息
          </div>
          <div v-if="sessionsLoading" class="list-empty">加载中...</div>
        </div>
      </section>

      <!-- 右侧详情 -->
      <main class="msg-main">
        <template v-if="currentMode === 'myMessages'">
          <!-- 聊天框 -->
          <div v-if="currentSession && currentSessionId" class="chat-box">
            <div class="chat-top">
              <span class="chat-top-name">{{
                  getUserDisplayName(currentSession.peerUser)
                }}</span>
              <div class="chat-more-wrap" ref="chatMoreRef">
                <button class="chat-more-btn" @click.stop="toggleChatMenu" title="更多">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.7"/>
                    <circle cx="12" cy="12" r="1.7"/>
                    <circle cx="12" cy="19" r="1.7"/>
                  </svg>
                </button>
                <Transition name="fade">
                  <div v-if="showChatMenu" class="chat-menu-dropdown">
                    <button class="menu-item">置顶聊天</button>
                    <button class="menu-item">开启免扰</button>
                    <button class="menu-item">加入黑名单</button>
                    <button class="menu-item">举报该用户</button>
                    <button class="menu-item">
                      不接收推送
                      <span class="menu-sub">通知正常接收</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <div class="chat-area" ref="chatMessagesRef" @scroll="onChatScroll">
              <div v-if="currentMessagesLoading" class="chat-load-top">
                <span class="load-spinner">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <!-- 12 个圆点，每个角度 30°，透明度从高到低渐变 -->
                    <g fill="#8d98a5">
                      <circle cx="12" cy="2.5" r="1.6" opacity="1"/>
                      <circle cx="16.3" cy="4.05" r="1.6" opacity="0.92"/>
                      <circle cx="19.5" cy="7.25" r="1.6" opacity="0.83"/>
                      <circle cx="21" cy="11.55" r="1.6" opacity="0.75"/>
                      <circle cx="19.5" cy="15.85" r="1.6" opacity="0.67"/>
                      <circle cx="16.3" cy="19.05" r="1.6" opacity="0.58"/>
                      <circle cx="12" cy="20.6" r="1.6" opacity="0.5"/>
                      <circle cx="7.7" cy="19.05" r="1.6" opacity="0.42"/>
                      <circle cx="4.5" cy="15.85" r="1.6" opacity="0.33"/>
                      <circle cx="3" cy="11.55" r="1.6" opacity="0.25"/>
                      <circle cx="4.5" cy="7.25" r="1.6" opacity="0.17"/>
                      <circle cx="7.7" cy="4.05" r="1.6" opacity="0.08"/>
                    </g>
                  </svg>
                </span>
                <span class="load-tip">加载中…</span>
              </div>
              <div v-else-if="!hasMoreMessages && currentMessages.length > 0"
                   class="chat-load-top">
                <span class="load-tip">没有更多消息了</span>
              </div>
              <template v-for="(msg, msgIndex) in currentMessages"
                        :key="msg.id || msg.clientMessageId">
                <div v-if="shouldShowTime(msgIndex)" class="chat-time-divider">
                  {{ formatChatTime(msg.createTime) }}
                </div>
                <div
                  class="msg-bubble-wrap"
                  :class="{ me: msg.senderUid === myUid, failed: msg.status === 'failed' }"
                >
                  <a
                    v-if="msg.senderUid !== myUid && msg.senderUser"
                    :href="`/space/${msg.senderUser.uid}`" class="msg-avatar-link"
                    target="_blank"
                  ><img :src="msg.senderUser.avatar || defaultAvatar" class="msg-avatar"
                        alt=""/></a>
                  <img v-else-if="msg.senderUid !== myUid"
                       :src="msg.senderUser?.avatar || defaultAvatar"
                       class="msg-avatar" alt=""/>
                  <div class="msg-bubble" :class="{ 'msg-failed': msg.status === 'failed' }"
                       @click="msg.status === 'failed' && retrySend(msg)">
                    <span v-if="msg.status === 'sending'" class="msg-sending-dot"></span>
                    <span class="msg-text"><MentionContent :content="msg.content"/></span>
                    <span v-if="msg.status === 'failed'"
                          class="msg-failed-label">发送失败，点击重试</span>
                  </div>
                  <a
                    v-if="msg.senderUid === myUid"
                    :href="`/space/${myUid}`" class="msg-avatar-link"
                    target="_blank"
                  ><img :src="currentUserAvatar" class="msg-avatar" alt=""/></a>
                </div>
              </template>
              <div v-if="currentMessages.length === 0 && !currentMessagesLoading"
                   class="chat-empty">暂无消息，打个招呼吧
              </div>
            </div>

            <div class="chat-foot">
              <div class="chat-tools" aria-label="消息工具">
                <button type="button" title="发送图片">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                       stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <circle cx="9" cy="10" r="1.6"/>
                    <path d="m5 18 5.5-5.5c.4-.4 1-.4 1.4 0L18 18.5"/>
                    <path d="m15 15 1.6-1.6c.4-.4 1-.4 1.4 0l3 3"/>
                  </svg>
                </button>
                <button type="button" title="表情">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                       stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M8.5 14.5c.8 1 2 1.6 3.5 1.6s2.7-.6 3.5-1.6"/>
                    <path d="M9 9.5h.01M15 9.5h.01"/>
                  </svg>
                </button>
              </div>
              <textarea
                v-model="inputContent"
                class="chat-textarea"
                placeholder="请输入消息内容"
                maxlength="500"
                @keydown.enter.exact.prevent="handleSend"
              ></textarea>
              <div class="chat-submit-row">
                <span class="chat-hint">{{ inputContent.length }}/500</span>
                <button class="send-btn" :disabled="!inputContent.trim()" @click="handleSend">发送
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态插画 -->
          <div v-else class="empty-state">
            <div class="empty-art">
              <svg viewBox="0 0 440 260" xmlns="http://www.w3.org/2000/svg">
                <!-- 地面曲线 -->
                <path d="M40 205 Q220 158 400 200" fill="none" stroke="#a7b7c4" stroke-width="2.5"
                      stroke-linecap="round"/>
                <path d="M86 196 q5 -13 12 -5" fill="none" stroke="#b9c8d3" stroke-width="2"
                      stroke-linecap="round"/>
                <path d="M352 188 q6 -12 12 -4" fill="none" stroke="#b9c8d3" stroke-width="2"
                      stroke-linecap="round"/>

                <!-- 左边蓝发女孩 -->
                <g transform="translate(118, 58)">
                  <!-- 省略号气泡 -->
                  <g transform="translate(58, -14)">
                    <ellipse cx="0" cy="0" rx="17" ry="11" fill="#fff" stroke="#a7b7c4"
                             stroke-width="1.5"/>
                    <path d="M-6 10 L-10 17 L0 11" fill="#fff" stroke="#a7b7c4" stroke-width="1.5"
                          stroke-linejoin="round"/>
                    <circle cx="-7" cy="0" r="1.8" fill="#8d9aa6"/>
                    <circle cx="0" cy="0" r="1.8" fill="#8d9aa6"/>
                    <circle cx="7" cy="0" r="1.8" fill="#8d9aa6"/>
                  </g>
                  <!-- 后发 -->
                  <path
                    d="M8 62 Q2 16 40 12 Q78 16 72 62 L70 100 Q66 110 60 100 L62 64 Q58 46 40 44 Q22 46 18 64 L20 100 Q14 110 10 100 Z"
                    fill="#9cc3ec"/>
                  <!-- 脸 -->
                  <circle cx="40" cy="60" r="23" fill="#ffeede"/>
                  <!-- 刘海 -->
                  <path
                    d="M17 54 Q19 35 40 33 Q61 35 63 54 Q58 45 53 49 Q50 41 45 47 Q40 41 35 47 Q30 41 27 49 Q22 45 17 54 Z"
                    fill="#9cc3ec"/>
                  <!-- 呆毛 -->
                  <path d="M40 12 Q45 2 54 7" fill="none" stroke="#9cc3ec" stroke-width="3.5"
                        stroke-linecap="round"/>
                  <!-- 眼睛 -->
                  <circle cx="31" cy="62" r="2.4" fill="#4e5a64"/>
                  <circle cx="49" cy="62" r="2.4" fill="#4e5a64"/>
                  <!-- 腮红 + 嘴 -->
                  <ellipse cx="25" cy="68" rx="3.4" ry="2" fill="#ffc2d1" opacity="0.75"/>
                  <ellipse cx="55" cy="68" rx="3.4" ry="2" fill="#ffc2d1" opacity="0.75"/>
                  <path d="M37 70 Q40 72.5 43 70" fill="none" stroke="#4e5a64" stroke-width="1.3"
                        stroke-linecap="round"/>
                  <!-- 身体(裙子) -->
                  <path d="M20 84 Q40 76 60 84 L66 118 Q40 128 14 118 Z" fill="#f4f8fb"
                        stroke="#a7b7c4" stroke-width="1.5"/>
                  <path d="M22 96 Q30 106 40 104 M58 96 Q50 106 40 104" fill="none" stroke="#a7b7c4"
                        stroke-width="1.5" stroke-linecap="round"/>
                  <!-- 盘坐的腿 -->
                  <path d="M16 118 Q28 108 40 116 Q52 108 64 118" fill="none" stroke="#a7b7c4"
                        stroke-width="1.5" stroke-linecap="round"/>
                </g>

                <!-- 中间小猫 -->
                <g transform="translate(218, 150)">
                  <ellipse cx="0" cy="30" rx="16" ry="14" fill="#fff" stroke="#a7b7c4"
                           stroke-width="1.5"/>
                  <circle cx="0" cy="12" r="11" fill="#fff" stroke="#a7b7c4" stroke-width="1.5"/>
                  <path d="M-9 4 L-12 -6 L-3 1 M9 4 L12 -6 L3 1" fill="#fff" stroke="#a7b7c4"
                        stroke-width="1.5" stroke-linejoin="round"/>
                  <circle cx="-3.5" cy="12" r="1.3" fill="#4e5a64"/>
                  <circle cx="3.5" cy="12" r="1.3" fill="#4e5a64"/>
                  <path d="M-1.5 16 Q0 17.5 1.5 16" fill="none" stroke="#4e5a64" stroke-width="1"
                        stroke-linecap="round"/>
                  <path d="M14 34 Q24 30 22 20" fill="none" stroke="#a7b7c4" stroke-width="1.5"
                        stroke-linecap="round"/>
                </g>

                <!-- 右边粉发女孩(睡觉) -->
                <g transform="translate(268, 62)">
                  <text x="60" y="-12" font-size="15" font-weight="bold" fill="#a7b7c4"
                        font-family="Arial">Z
                  </text>
                  <text x="72" y="-21" font-size="11" font-weight="bold" fill="#bcc9d4"
                        font-family="Arial">z
                  </text>
                  <text x="50" y="-2" font-size="11" font-weight="bold" fill="#bcc9d4"
                        font-family="Arial">z
                  </text>
                  <!-- 后发 -->
                  <path
                    d="M8 62 Q2 16 40 12 Q78 16 72 62 L70 100 Q66 110 60 100 L62 64 Q58 46 40 44 Q22 46 18 64 L20 100 Q14 110 10 100 Z"
                    fill="#ffc7d6"/>
                  <!-- 脸 -->
                  <circle cx="40" cy="60" r="23" fill="#ffeede"/>
                  <!-- 刘海 -->
                  <path
                    d="M17 54 Q19 35 40 33 Q61 35 63 54 Q58 45 53 49 Q50 41 45 47 Q40 41 35 47 Q30 41 27 49 Q22 45 17 54 Z"
                    fill="#ffc7d6"/>
                  <!-- 闭眼 -->
                  <path d="M26 62 Q31 58 36 62 M44 62 Q49 58 54 62" fill="none" stroke="#4e5a64"
                        stroke-width="1.6" stroke-linecap="round"/>
                  <!-- 睡着的小圆嘴 -->
                  <circle cx="40" cy="70" r="2" fill="#4e5a64"/>
                  <ellipse cx="25" cy="67" rx="3.4" ry="2" fill="#ffb3c6" opacity="0.75"/>
                  <ellipse cx="55" cy="67" rx="3.4" ry="2" fill="#ffb3c6" opacity="0.75"/>
                  <!-- 身体 -->
                  <path d="M20 84 Q40 76 60 84 L66 118 Q40 128 14 118 Z" fill="#f4f8fb"
                        stroke="#a7b7c4" stroke-width="1.5"/>
                  <path d="M22 96 Q30 106 40 104 M58 96 Q50 106 40 104" fill="none" stroke="#a7b7c4"
                        stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M16 118 Q28 108 40 116 Q52 108 64 118" fill="none" stroke="#a7b7c4"
                        stroke-width="1.5" stroke-linecap="round"/>
                </g>
              </svg>
            </div>
            <p class="empty-text">快找小伙伴聊天吧！(´･ω･`)</p>
          </div>
        </template>

        <!-- 点赞详情：由路由 /like/:bizType/:bizId 渲染，可回退、可刷新 -->
        <template v-else-if="currentMode === 'like' && likeDetailBiz">
          <LikeDetail
            :biz-type="likeDetailBiz.bizType"
            :biz-id="likeDetailBiz.bizId"
          />
        </template>

        <!-- 通知模式右侧：通知列表直接展示，不再需要中间的 msg-list -->
        <div v-else class="notice-scroll">
          <!-- 收到的赞（按 bizType+bizId 分组聚合展示） -->
          <template v-if="currentMode === 'like'">
            <div
              v-for="group in groupedLikes"
              :key="'like-g-' + group.key"
              class="like-group-card"
              :class="{ unread: group.notices.some((n: MessageNotice) => n.isRead === 0) }"
              @click="goLikeDetail(group.bizType, group.bizId)"
            >
              <!-- 左侧：最多显示两个头像交错 -->
              <div
                class="like-avatars"
                :class="{ 'like-avatars--two': group.topUsers.length >= 2 }"
                @click.stop
              >
                <span
                  v-for="(user, idx) in group.topUsers"
                  :key="user.uid"
                  class="like-avatar-wrap"
                  :data-idx="idx"
                  @click.stop="goUserSpace(user.uid)"
                >
                  <img class="like-avatar-img" :src="user.avatar || defaultAvatar" alt=""/>
                </span>
              </div>

              <!-- 中间：用户名 + 统计文案 -->
              <div class="like-body">
                <p class="like-title">
                  <template v-if="group.count > 1">
                    <template v-for="(user, idx) in group.topUsers" :key="user.uid">
                      <span
                        class="like-name"
                        @click.stop="goUserSpace(user.uid)"
                      >{{ user.username }}</span>
                      <template v-if="idx < group.topUsers.length - 1">、</template>
                    </template>
                    <span class="like-summary">等总计{{ group.count }}人赞了我的{{
                        group.targetLabel
                      }}</span>
                  </template>
                  <template v-else>
                    <template v-for="(user) in group.topUsers" :key="user.uid">
                      <span
                        class="like-name"
                        @click.stop="goUserSpace(user.uid)"
                      >{{ user.username }}</span>
                    </template>
                    <span class="like-summary">赞了我的{{ group.targetLabel }}</span>
                  </template>
                </p>
                <div class="like-foot">
                  <span class="like-time">{{ formatTime(group.latestTime) }}</span>
                  <button class="like-act" title="删除该通知" @click.stop="deleteLikeGroup(group)">
                    删除该通知
                  </button>
                  <button class="like-act" title="不再通知" @click.stop="muteLikeGroup(group)">
                    不再通知
                  </button>
                </div>
              </div>

              <!-- 右侧：视频封面 或 评论内容摘要 -->
              <div class="like-right" @click.stop>
                <template v-if="group.bizType === 'video' && group.videoCover">
                  <img class="like-cover" :src="group.videoCover" alt=""
                       @click="goNoticeTarget(group.notices[0])"/>
                </template>
                <template v-else-if="group.bizType === 'comment' && group.contentPreview">
                  <span class="like-comment-preview"
                        @click="goNoticeTarget(group.notices[0])">{{ group.contentPreview }}</span>
                </template>
                <template v-else-if="group.bizType === 'video'">
                  <span class="like-cover-placeholder" @click="goNoticeTarget(group.notices[0])">查看视频</span>
                </template>
              </div>

              <span v-if="group.notices.some((n: MessageNotice) => n.isRead === 0)"
                    class="ntc-dot"></span>
            </div>
          </template>

          <!-- 回复我的 / @我的 / 系统通知 等其他通知类型 -->
          <template v-for="notice in nonLikeNotices" :key="notice.id">
            <!-- 回复我的 -->
            <div
              v-if="notice.noticeType === 'reply'"
              class="ntc-card"
              :class="{ unread: notice.isRead === 0, 'ntc-card--active': activeReplyNoticeId === notice.id }"
              @click="goNoticeTarget(notice)"
            >
              <span
                v-if="notice.actorUser"
                class="ntc-avatar-link"
                @click.stop="goUserSpace(notice.actorUser.uid)"
              ><img class="ntc-avatar" :src="notice.actorUser.avatar || defaultAvatar"
                    alt=""/></span>
              <img v-else class="ntc-avatar" :src="defaultAvatar" alt=""/>
              <div class="ntc-main">
                <p class="ntc-line">
              <span
                v-if="notice.actorUser"
                class="ntc-actor"
                @click.stop="goUserSpace(actorUid(notice))"
              >{{ actorName(notice) }}</span>
                  <b v-else class="ntc-actor">{{ actorName(notice) }}</b>
                  <span class="ntc-action">{{ noticeReplyLabel(notice) }}</span>
                </p>
                <!-- 回复内容：回复 @被回复者：回复内容 -->
                <p v-if="notice.contentSummary" class="ntc-reply-line">
                  <template v-if="notice.bizType === 'comment'">回复
                    @{{ noticeExt(notice).originUsername || userStore.user?.username }}：
                    <MentionContent :content="notice.contentSummary"
                                    :mention-users="noticeExt(notice).mentionUsers"/>
                  </template>
                  <template v-else>「
                    <MentionContent :content="notice.contentSummary"
                                    :mention-users="noticeExt(notice).mentionUsers"/>
                    」
                  </template>
                </p>
                <!-- 被回复的原评论内容：被回复者：评论内容 -->
                <p v-if="notice.bizType === 'comment' && noticeExt(notice).originContent"
                   class="ntc-quote">
                  {{ noticeExt(notice).originUsername || userStore.user?.username }}：
                  <MentionContent :content="noticeExt(notice).originContent"
                                  :mention-users="noticeExt(notice).originMentionUsers || noticeExt(notice).mentionUsers"/>
                </p>
                <div class="ntc-foot">
                  <span class="ntc-time">{{ formatTime(notice.createTime) }}</span>
                  <button class="ntc-act" title="点赞" @click.stop="likeNoticeComment(notice)">
                    <svg viewBox="0 0 24 24" :fill="noticeLikedMap[notice.id] ? '#00a1d6' : 'none'"
                         stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    点赞
                  </button>
                  <button class="ntc-act" title="删除该通知" @click.stop="deleteNotice(notice)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    删除该通知
                  </button>
                  <button class="ntc-act" title="回复" @click.stop="toggleNoticeReply(notice)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 17l-5-5 5-5"/>
                      <path d="M4 12h11a4 4 0 0 1 4 4v2"/>
                    </svg>
                    回复
                  </button>
                </div>
                <!-- 内联回复输入框：放在 ntc-foot 下面、ntc-main 内部 -->
                <div v-if="activeReplyNoticeId === notice.id" class="ntc-reply-box" @click.stop>
                  <img class="ntc-reply-avatar" :src="currentUserAvatar" alt=""/>
                  <div class="ntc-reply-editor">
                    <textarea
                      ref="noticeReplyTextareaRef"
                      v-model="noticeReplyContent"
                      class="ntc-reply-input"
                      placeholder="请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。"
                      maxlength="500"
                      rows="3"
                      @keydown.enter.exact.prevent="sendNoticeReply(notice)"
                    ></textarea>
                    <div class="ntc-reply-actions">
                      <el-button size="small" @click.stop="activeReplyNoticeId = null">取消
                      </el-button>
                      <el-button type="primary" size="small" :disabled="!noticeReplyContent.trim()"
                                 @click.stop="sendNoticeReply(notice)">发表评论
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <span
                v-if="noticeExt(notice).isReply && noticeExt(notice).rootCommentContent"
                class="ntc-thumb ntc-thumb--text"
                @click.stop="goNoticeTarget(notice)"
              ><MentionContent :content="noticeExt(notice).rootCommentContent"
                               :mention-users="noticeExt(notice).rootMentionUsers || noticeExt(notice).mentionUsers"/></span>
              <span
                v-else-if="noticeExt(notice).videoId"
                class="ntc-thumb"
                @click.stop="goNoticeTarget(notice)"
              >
                <img v-if="noticeExt(notice).videoCover" :src="noticeExt(notice).videoCover"
                     alt=""/>
                <span v-else class="ntc-thumb-text">查看视频</span>
              </span>
              <span
                v-else-if="notice.bizType === 'dynamic' && noticeDynamicContent(notice)"
                class="ntc-thumb ntc-thumb--text"
                title="查看原动态"
                @click.stop="goNoticeTarget(notice)"
              >{{ noticeDynamicContent(notice) }}</span>
              <span
                v-else-if="notice.bizId"
                class="ntc-thumb ntc-thumb--link"
                @click.stop="goNoticeTarget(notice)"
              >
                <span class="ntc-thumb-text">{{ notice.bizType === 'dynamic' ? '查看动态' : '查看原评论' }}</span>
              </span>
              <span v-if="notice.isRead === 0" class="ntc-dot"></span>
            </div>

            <!-- @我的 -->
            <div
              v-else-if="notice.noticeType === 'at'"
              class="ntc-card"
              :class="{ unread: notice.isRead === 0, 'ntc-card--active': activeReplyNoticeId === notice.id }"
              @click="goNoticeTarget(notice)"
            >
              <span
                v-if="notice.actorUser"
                class="ntc-avatar-link"
                @click.stop="goUserSpace(notice.actorUser.uid)"
              ><img class="ntc-avatar" :src="notice.actorUser.avatar || defaultAvatar"
                    alt=""/></span>
              <img v-else class="ntc-avatar" :src="defaultAvatar" alt=""/>
              <div class="ntc-main">
                <p class="ntc-line">
              <span
                v-if="notice.actorUser"
                class="ntc-actor"
                @click.stop="goUserSpace(actorUid(notice))"
              >{{ actorName(notice) }}</span>
                  <b v-else class="ntc-actor">{{ actorName(notice) }}</b>
                  <span class="ntc-action">{{
                      notice.bizType === 'dynamic' ? '在动态中@了我' : '在评论中@了我'
                    }}</span>
                </p>
                <p v-if="notice.contentSummary" class="ntc-reply-line">
                  <template v-if="noticeExt(notice).isReply">回复
                    @{{ noticeExt(notice).originUsername || userStore.user?.username }}：
                    <MentionContent :content="notice.contentSummary"
                                    :mention-users="noticeExt(notice).mentionUsers"/>
                  </template>
                  <template v-else>「
                    <MentionContent :content="notice.contentSummary"
                                    :mention-users="noticeExt(notice).mentionUsers"/>
                    」
                  </template>
                </p>
                <div class="ntc-foot">
                  <span class="ntc-time">{{ formatTime(notice.createTime) }}</span>
                  <button class="ntc-act" title="点赞" @click.stop="likeNoticeComment(notice)">
                    <svg viewBox="0 0 24 24" :fill="noticeLikedMap[notice.id] ? '#00a1d6' : 'none'"
                         stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    点赞
                  </button>
                  <button class="ntc-act" title="删除该通知" @click.stop="deleteNotice(notice)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    删除该通知
                  </button>
                  <button class="ntc-act" title="回复" @click.stop="toggleNoticeReply(notice)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 17l-5-5 5-5"/>
                      <path d="M4 12h11a4 4 0 0 1 4 4v2"/>
                    </svg>
                    回复
                  </button>
                </div>
                <!-- 内联回复输入框 -->
                <div v-if="activeReplyNoticeId === notice.id" class="ntc-reply-box" @click.stop>
                  <img class="ntc-reply-avatar" :src="currentUserAvatar" alt=""/>
                  <div class="ntc-reply-editor">
                    <textarea
                      v-model="noticeReplyContent"
                      class="ntc-reply-input"
                      placeholder="请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。"
                      maxlength="500"
                      rows="3"
                      @keydown.enter.exact.prevent="sendNoticeReply(notice)"
                    ></textarea>
                    <div class="ntc-reply-actions">
                      <el-button size="small" @click.stop="activeReplyNoticeId = null">取消
                      </el-button>
                      <el-button type="primary" size="small" :disabled="!noticeReplyContent.trim()"
                                 @click.stop="sendNoticeReply(notice)">发表评论
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <span
                v-if="noticeExt(notice).isReply && noticeExt(notice).rootCommentContent"
                class="ntc-thumb ntc-thumb--text"
                @click.stop="goNoticeTarget(notice)"
              ><MentionContent :content="noticeExt(notice).rootCommentContent"
                               :mention-users="noticeExt(notice).rootMentionUsers || noticeExt(notice).mentionUsers"/></span>
              <span
                v-else-if="noticeExt(notice).videoId"
                class="ntc-thumb"
                @click.stop="goNoticeTarget(notice)"
              >
                <img v-if="noticeExt(notice).videoCover" :src="noticeExt(notice).videoCover"
                     alt=""/>
                <span v-else class="ntc-thumb-text">查看视频</span>
              </span>
              <span v-if="notice.isRead === 0" class="ntc-dot"></span>
            </div>

            <!-- 其他（系统通知等）保持原有通用样式 -->
            <div
              v-else
              class="notice-row"
              :class="{ unread: notice.isRead === 0 }"
              @click="goNoticeTarget(notice)"
            >
              <img v-if="notice.actorUser" :src="notice.actorUser.avatar || defaultAvatar"
                   class="ntc-avatar" alt=""/>
              <div v-else class="ntc-icon" :class="notice.noticeType">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                  <path
                    d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                </svg>
              </div>
              <div class="ntc-body">
                <p class="ntc-title">
                  <b v-if="notice.actorUser" class="ntc-actor">{{ getUserDisplayName(notice.actorUser) }}</b>
                  {{ notice.title }}
                </p>
                <p v-if="notice.contentSummary" class="ntc-summary">
                  <MentionContent :content="notice.contentSummary"
                                  :mention-users="noticeExt(notice).mentionUsers"/>
                </p>
                <span class="ntc-time">{{ formatTime(notice.createTime) }}</span>
              </div>
              <span v-if="notice.isRead === 0" class="ntc-dot"></span>
            </div>
          </template>
          <div v-if="!noticesLoading && notices.length === 0" class="empty-state">
            <p class="empty-text">{{ noticeEmptyTitle }}</p>
            <p class="empty-sub">去看看有什么新鲜事吧</p>
          </div>
          <div v-if="noticesLoading" class="list-empty">加载中...</div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useMessageStore} from '@/stores/messageStore'
import {useUserStore} from '@/stores/userStore'
import HeaderBar from '@/components/header-bar/HeaderBar.vue'
import MentionContent from '@/components/mention-content/MentionContent.vue'
import LikeDetail from '@/views/message/LikeDetail.vue'
import type {MessageSession, MessageNotice, MessagePrivateMessage, Dynamic, DynamicApiResponse} from '@/types/api'
import {COMMENT_API} from '@/api/comment'
import {DYNAMIC_API} from '@/api/dynamic'
import {get, post} from '@/utils/request'
import {getUserDisplayName} from '@/utils/utils'
import {ElMessageBox} from 'element-plus'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI0MCIgZmlsbD0iI2UzZTVlNyIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMzIiIHI9IjEyIiBmaWxsPSIjYzljZGQ0Ii8+PHBhdGggZD0iTTEzIDY4YzAtMTQuOTEyIDEyLjA4OC0yNyAyNy0yN3MyNyAxMi4wODggMjcgMjciIGZpbGw9IiNjOWNkZDQiLz48L3N2Zz4='

// 主导航模式: myMessages / reply / at / like / system
type NavMode = 'myMessages' | 'reply' | 'at' | 'like' | 'system' | 'config'
const currentMode = ref<NavMode>('myMessages')
const inputContent = ref('')
const showStrangerSessions = ref(false)
const chatMessagesRef = ref<HTMLElement | null>(null)
const chatMoreRef = ref<HTMLElement | null>(null)
const showChatMenu = ref(false)
const hasMoreMessages = ref(true)
const scrolledToBottom = ref(false)
let disconnectedChatRefreshTimer: ReturnType<typeof setInterval> | null = null
let messageListRefreshTimer: ReturnType<typeof setInterval> | null = null

const myUid = computed(() => userStore.user?.uid ?? 0)
const currentUserAvatar = computed(() => userStore.user?.avatar || defaultAvatar)
const unread = computed(() => messageStore.unread)

// 通知卡片内联回复相关状态
const activeReplyNoticeId = ref<number | null>(null)
const noticeReplyContent = ref('')
const noticeLikedMap = ref<Record<number, boolean>>({})
const noticeReplyTextareaRef = ref<HTMLTextAreaElement | null>(null)

// 动态通知对应的动态详情缓存（dynamicId -> Dynamic），用于「回复我的」右侧显示动态正文
const noticeDynamicMap = ref<Record<number, Dynamic>>({})
const noticeDynamicPending = new Set<number>()

function noticeDynamicId(notice: MessageNotice): number {
  return noticeExt(notice).dynamicId || notice.bizId || 0
}

// 动态正文预览：优先正文，无正文则用标题（拉取失败/为空时返回空串，模板回落到「查看动态」兜底）
function noticeDynamicContent(notice: MessageNotice): string {
  const dynamic = noticeDynamicMap.value[noticeDynamicId(notice)]
  if (!dynamic) return ''
  return (dynamic.content || dynamic.title || '').trim()
}

async function loadNoticeDynamic(notice: MessageNotice) {
  const id = noticeDynamicId(notice)
  if (!id || noticeDynamicMap.value[id] || noticeDynamicPending.has(id)) return
  noticeDynamicPending.add(id)
  try {
    const res = await get<DynamicApiResponse>(`${DYNAMIC_API.DETAIL}/${id}`)
    if (res.code === 200 && res.data) {
      noticeDynamicMap.value[id] = res.data
    }
  } catch {
    // 拉取失败保持空，展示层回落到「查看动态」兜底
  } finally {
    noticeDynamicPending.delete(id)
  }
}
// 点赞详情目标：从路由 /like/:bizType/:bizId 派生，使路径可变化、可回退（刷新仍有效）
const likeDetailBiz = computed(() => {
  const m = route.path.match(/^\/like\/([^/]+)\/(\d+)$/)
  if (!m) return null
  return {bizType: m[1], bizId: Number(m[2])}
})

// 合并关注 + 陌生人会话，按最后消息时间倒序
function sortSessions(sessions: MessageSession[]) {
  return [...sessions].sort((a, b) => {
    const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
    const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
    return tb - ta
  })
}

const followSessionList = computed(() => sortSessions(messageStore.followSessions))
const strangerSessionList = computed(() => sortSessions(messageStore.strangerSessions))
const sessionsLoading = computed(() => messageStore.followSessionsLoading || messageStore.strangerSessionsLoading)
const currentSessionId = computed(() => messageStore.currentSessionId)
const currentSession = computed(() => messageStore.currentSession)
const currentMessages = computed(() => messageStore.currentMessages)
const currentMessagesLoading = computed(() => messageStore.currentMessagesLoading)
const notices = computed(() => messageStore.notices)
const noticesLoading = computed(() => messageStore.noticesLoading)

// 通知列表变化时预取「回复我的」里动态通知对应的动态正文
watch(() => notices.value, (list) => {
  list.forEach((n) => {
    if (n.noticeType === 'reply' && n.bizType === 'dynamic') loadNoticeDynamic(n)
  })
}, {immediate: true})

// 左侧“我的消息”仅代表已关注用户的私信；陌生人消息在中间单独分组展示。
// 不直接使用服务端 privateUnread：服务端汇总可能暂时包含当前已打开会话，
// 这里以会话行状态为准，并明确排除当前会话。
const totalUnreadBadge = computed(() => followSessionList.value.reduce((total, session) => {
  if (session.sessionId === currentSessionId.value) return total
  return total + Math.max(0, session.unreadCount || 0)
}, 0))
const visibleFollowUnreadBadge = computed(() => {
  // 列表首次加载前，先用已经由 App 拉取的汇总值渲染，避免左侧红点晚于头部。
  if (!currentSessionId.value && followSessionList.value.length === 0) {
    return unread.value.privateUnread
  }
  return totalUnreadBadge.value
})

const navItems = computed<{ key: NavMode; label: string; badge: number }[]>(() => [
  {key: 'myMessages', label: '我的消息', badge: visibleFollowUnreadBadge.value},
  {key: 'reply', label: '回复我的', badge: unread.value.replyUnread},
  {key: 'at', label: '@我的', badge: unread.value.atUnread},
  {key: 'like', label: '收到的赞', badge: unread.value.likeUnread},
  {key: 'system', label: '系统通知', badge: unread.value.systemUnread},
])

const listPanelTitle = computed(() => {
  const map: Record<NavMode, string> = {
    myMessages: '我的消息',
    reply: '回复我的',
    at: '@我的',
    like: '收到的赞',
    system: '系统通知',
    config: '消息设置',
  }
  return map[currentMode.value]
})

const noticeEmptyTitle = computed(() => {
  const map: Record<NavMode, string> = {
    myMessages: '我的消息',
    reply: '还没有回复通知',
    at: '还没有@通知',
    like: '还没有赞通知',
    system: '还没有系统通知',
    config: '消息设置',
  }
  return map[currentMode.value]
})

// 点赞分组数据类型
interface LikeGroup {
  key: string
  bizType: string
  bizId: number | null
  notices: MessageNotice[]
  topUsers: { uid: number; username: string; avatar?: string }[]
  count: number
  targetLabel: string
  latestTime: string
  videoCover?: string
  contentPreview?: string
}

// 非 like 类型的通知（用于 reply/at/system 等原有卡片遍历）
const nonLikeNotices = computed(() => notices.value.filter((n) => n.noticeType !== 'like'))

// 将 like 通知按 (bizType, bizId) 分组聚合
const groupedLikes = computed<LikeGroup[]>(() => {
  const likeNotices = notices.value.filter((n) => n.noticeType === 'like')
  const map = new Map<string, MessageNotice[]>()
  for (const notice of likeNotices) {
    const key = `${notice.bizType ?? ''}_${notice.bizId ?? 0}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(notice)
  }
  const groups: LikeGroup[] = []
  for (const [key, list] of map) {
    const first = list[0]
    const bizType = first.bizType || ''
    const bizId = first.bizId || 0
    const ext = noticeExt(first)
    // 取前两个不同用户的头像/用户名
    const userMap = new Map<number, { uid: number; username: string; avatar?: string }>()
    for (const n of list) {
      if (n.actorUser && !userMap.has(n.actorUser.uid)) {
        userMap.set(n.actorUser.uid, {
          uid: n.actorUser.uid,
          username: getUserDisplayName(n.actorUser),
          avatar: n.actorUser.avatar
        })
        if (userMap.size >= 2) break
      }
    }
    const topUsers = [...userMap.values()]
    // 评论类型取第一条 contentSummary 作为预览
    const contentPreview = bizType === 'comment' ? (first.contentSummary || undefined) : undefined
    groups.push({
      key,
      bizType,
      bizId,
      notices: list,
      topUsers,
      count: list.length,
      targetLabel: likeTargetLabel(first),
      latestTime: list.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())[0].createTime,
      videoCover: ext.videoCover,
      contentPreview,
    })
  }
  // 按最新时间倒序
  groups.sort((a, b) => new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime())
  return groups
})

function formatTime(timeStr: string | null): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < oneDay) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  if (diff < 2 * oneDay) return '昨天'
  if (diff < 365 * oneDay) {
    return `${date.getMonth() + 1}-${date.getDate()}`
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function formatChatTime(timeStr: string): string {
  const date = new Date(timeStr)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  if (sameDay) return `今天 ${h}:${min}`
  return `${y}-${m}-${d} ${h}:${min}`
}

// 首条消息，或与上一条间隔超过 5 分钟时，展示时间分隔条
function shouldShowTime(index: number): boolean {
  if (index === 0) return true
  const prev = new Date(currentMessages.value[index - 1].createTime).getTime()
  const curr = new Date(currentMessages.value[index].createTime).getTime()
  return curr - prev > 5 * 60 * 1000
}

async function switchNav(mode: NavMode) {
  // reply/like/at/config 为顶层平级路由，其余（含 system、myMessages）沿用 /message 下路径
  const flatPaths: Partial<Record<NavMode, string>> = {
    reply: '/reply',
    at: '/at',
    like: '/like',
    system: '/system',
    config: '/config',
  }
  const targetPath = flatPaths[mode] ?? (mode === 'myMessages' ? '/message' : `/message/${mode}`)
  await router.push(targetPath)
}

function handleSetting() {
  router.push('/config')
}

async function selectSession(session: MessageSession) {
  messageStore.currentSessionId = session.sessionId
  messageStore.currentSession = session
  messageStore.currentMessagePage = 1
  hasMoreMessages.value = true
  await messageStore.fetchSessionMessages(session.sessionId)
  await messageStore.markSessionRead(session.sessionId)
  // markSessionRead 内部已调用 fetchUnreadSummary()，无需重复
  await scrollChatToBottom()
}

function goToSession(session: MessageSession) {
  const uid = session.peerUser?.uid
  if (!uid) return
  router.push(showStrangerSessions.value ? `/message/unfollow/uid${uid}` : `/message/uid${uid}`)
}

// 删除会话
async function deleteSession(session: MessageSession) {
  if (!(await confirmDeleteNotice())) return
  if (currentSessionId.value === session.sessionId) {
    messageStore.currentSessionId = null
    messageStore.currentSession = null
    messageStore.currentMessages = []
  }
  await messageStore.deleteSession(session.sessionId)
}

// 聊天顶部三点菜单
function toggleChatMenu() {
  showChatMenu.value = !showChatMenu.value
}

// 点击菜单外部关闭
onMounted(() => {
  document.addEventListener('click', closeChatMenuOnClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeChatMenuOnClickOutside)
})

function closeChatMenuOnClickOutside(e: Event) {
  if (chatMoreRef.value && !chatMoreRef.value.contains(e.target as Node)) {
    showChatMenu.value = false
  }
}

// 面包屑回退：退出未关注人分组，回到“最近消息”（已关注会话列表）。
function backToRecentMessages() {
  showStrangerSessions.value = false
  messageStore.currentSessionId = null
  messageStore.currentSession = null
  messageStore.currentMessages = []
  router.push('/message')
}

// 面包屑回退：从聊天会话回到“未关注的人”列表（保留未关注人分组与面包屑）。
function goToStrangerList() {
  router.push('/message/unfollow')
}

function routeUid(): number | null {
  const raw = String(route.params.uid || route.query.target || '')
  const uidText = raw.startsWith('uid') ? raw.slice(3) : raw
  const uid = Number(uidText)
  return Number.isSafeInteger(uid) && uid > 0 ? uid : null
}

async function syncSessionFromRoute() {
  const modeByPath: Record<string, NavMode> = {
    '/message': 'myMessages',
    '/reply': 'reply',
    '/at': 'at',
    '/like': 'like',
    '/system': 'system',
    '/config': 'config',
  }
  // 点赞详情 /like/:bizType/:bizId 也归属“收到的赞”模式
  if (route.path.startsWith('/like/')) {
    currentMode.value = 'like'
  } else {
    currentMode.value = modeByPath[route.path] || currentMode.value
  }
  showStrangerSessions.value = route.path === '/message/unfollow' || route.path.startsWith('/message/unfollow/')
  const targetUid = routeUid()
  if (!targetUid) {
    messageStore.currentSessionId = null
    messageStore.currentSession = null
    messageStore.currentMessages = []
    if (currentMode.value !== 'myMessages' && currentMode.value !== 'config') {
      await messageStore.fetchNotices(currentMode.value)
      // 进入通知页面（回复我的 / @我的 / 收到的赞 / 系统通知）即视为已读，
      // 批量消除当前类型下的所有未读标记。
      await messageStore.markAllNoticesRead(currentMode.value)
    }
    return
  }

  // 直接访问 /message/uidX 时，目标若属于未关注人，应归入“未关注人消息”分组，
  // 而不只按路由前缀判断，否则左侧不会切到未关注人列表、聊天也不归到该分组。
  let session = followSessionList.value.find((item) => item.peerUser?.uid === targetUid)
  if (!session) {
    session = strangerSessionList.value.find((item) => item.peerUser?.uid === targetUid)
    if (session) showStrangerSessions.value = true
  }
  if (session) {
    await selectSession(session)
  } else {
    const opened = await messageStore.openSession(targetUid)
    if (opened && !opened.following) {
      showStrangerSessions.value = true
    }
  }

  // 兼容旧的 /message?target=2 跳转，并统一到新的可复制聊天地址。
  if (!route.params.uid && route.query.target) {
    await router.replace(`/message/uid${targetUid}`)
  }
}

async function loadMore() {
  if (messageStore.currentSessionId) {
    hasMoreMessages.value = await messageStore.loadMoreMessages()
  }
}

function onChatScroll() {
  if (!chatMessagesRef.value) return
  const el = chatMessagesRef.value
  scrolledToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  // 滚动到顶部自动加载更早的消息
  if (el.scrollTop < 60 && hasMoreMessages.value && !currentMessagesLoading.value) {
    autoLoadMore()
  }
}

// 自动加载更早消息：保持当前阅读位置（加载后补偿顶部新增高度），避免跳动与无限循环
let autoLoading = false

async function autoLoadMore() {
  if (autoLoading || !chatMessagesRef.value) return
  autoLoading = true
  const el = chatMessagesRef.value
  const prevHeight = el.scrollHeight
  const prevTop = el.scrollTop
  await loadMore()
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight - prevHeight + prevTop
  }
  autoLoading = false
}

async function scrollChatToBottom() {
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    scrolledToBottom.value = true
  }
}

async function handleSend() {
  const content = inputContent.value.trim()
  if (!content || !messageStore.currentSession) return
  const targetUid = messageStore.currentSession.peerUser?.uid
  const sessionId = messageStore.currentSession.sessionId
  if (!targetUid) return
  inputContent.value = ''

  const cid = messageStore.genClientMessageId()
  const optimisticMsg: MessagePrivateMessage = {
    id: 0, sessionId, senderUid: myUid.value, receiverUid: targetUid, content,
    contentType: 'text', isRead: 0, createTime: new Date().toISOString(), readTime: null,
    senderUser: {
      uid: myUid.value,
      username: userStore.user.username,
      nickname: userStore.user.nickname,
      avatar: userStore.user.avatar,
    },
    clientMessageId: cid,
    status: 'sending',
  }

  // 乐观插入必须进入统一缓存，否则 HTTP/WS 返回后会被缓存同步覆盖。
  messageStore.mergeIncomingMessage(optimisticMsg)
  await scrollChatToBottom()

  // HTTP 可靠发送（携带 clientMessageId 供 store 精确替换）
  const msg = await messageStore.sendMessage(targetUid, content, cid)
  if (msg) {
    // mergeIncomingMessage 已在 store 中完成替换 + 缓存同步
    // 本地快速更新会话预览
    messageStore.updateCurrentSessionLocally(content)
  } else {
    // 发送失败：标记乐观消息为失败状态
    const failedIdx = messageStore.currentMessages.findIndex((m) => m.clientMessageId === cid)
    if (failedIdx >= 0) {
      messageStore.currentMessages[failedIdx] = {
        ...messageStore.currentMessages[failedIdx],
        status: 'failed'
      }
    }
  }
}

/** 重试发送失败的消息 */
async function retrySend(failedMsg: MessagePrivateMessage) {
  if (!failedMsg.clientMessageId) return
  const targetUid = messageStore.currentSession?.peerUser?.uid
  if (!targetUid) return

  // 标记为 sending
  const idx = messageStore.currentMessages.findIndex((m) => m.clientMessageId === failedMsg.clientMessageId)
  if (idx >= 0) messageStore.currentMessages[idx] = {
    ...messageStore.currentMessages[idx],
    status: 'sending'
  }

  const msg = await messageStore.sendMessage(targetUid, failedMsg.content, failedMsg.clientMessageId)
  if (msg) {
    messageStore.updateCurrentSessionLocally(failedMsg.content)
  } else if (idx >= 0) {
    messageStore.currentMessages[idx] = {...messageStore.currentMessages[idx], status: 'failed'}
  }
}

// 解析通知扩展字段（后端可能在 extJson 中塞入 videoTitle / videoCover / originContent / originUsername 等）
type MentionUser = { uid: number; username: string; nickname?: string; avatar?: string }

function noticeExt(notice: MessageNotice): {
  videoId?: number
  videoTitle?: string
  videoCover?: string
  // 动态评论通知携带的动态ID（bizId 存的是评论ID）
  dynamicId?: number
  originContent?: string
  originUsername?: string
  originMentionUsers?: MentionUser[]
  isReply?: boolean
  rootCommentContent?: string
  rootMentionUsers?: MentionUser[]
  mentionUsers?: MentionUser[]
} {
  if (!notice.extJson) return {}
  try {
    return JSON.parse(notice.extJson) || {}
  } catch {
    return {}
  }
}

// 收到的赞：根据 bizType 展示点赞目标类型
function likeTargetLabel(notice: MessageNotice): string {
  if (notice.bizType === 'video') return '视频'
  if (notice.bizType === 'comment') return '评论'
  if (notice.bizType === 'danmaku') return '弹幕'
  return notice.title || '内容'
}

// 回复通知：根据 bizType 区分"回复我的评论""对我的视频发表评论"与"对我的动态发表评论"
function noticeReplyLabel(notice: MessageNotice): string {
  // bizType=comment：别人回复了我的某条评论；bizType=video：别人对我的视频发表根评论；bizType=dynamic：别人对我的动态发表评论
  if (notice.bizType === 'comment') {
    return '回复了我的评论'
  }
  if (notice.bizType === 'dynamic') {
    return '对我的动态发表了评论'
  }
  const count = notice.extJson ? (() => {
    try {
      const ext = JSON.parse(notice.extJson!);
      return ext.count || 1;
    } catch {
      return 1;
    }
  })() : 1
  if (count > 1) {
    return `等${count}人对我的视频发表了${count}条评论`
  }
  return '对我的视频发表了评论'
}

// 切换通知卡片内联回复输入框
function toggleNoticeReply(notice: MessageNotice) {
  if (!userStore.isLogin) {
    userStore.showLoginWindow = true
    return
  }
  if (activeReplyNoticeId.value === notice.id) {
    activeReplyNoticeId.value = null
    noticeReplyContent.value = ''
  } else {
    activeReplyNoticeId.value = notice.id
    noticeReplyContent.value = ''
    nextTick(() => {
      // 自动聚焦到 textarea
      const el = document.querySelector('.ntc-reply-input') as HTMLTextAreaElement
      if (el) el.focus()
    })
  }
}

// 发送通知内联回复（直接回复到对应视频的评论）
async function sendNoticeReply(notice: MessageNotice) {
  const content = noticeReplyContent.value.trim()
  if (!content || !notice.bizId) return
  try {
    await post(COMMENT_API.SEND_COMMENT, {
      vid: noticeExt(notice).videoId || (notice.bizType === 'video' ? notice.bizId : 0),
      content,
      rootId: 0,
      parentId: notice.bizId,
      toUserId: notice.actorUser?.uid || 0,
    })
    noticeReplyContent.value = ''
    activeReplyNoticeId.value = null
  } catch {
    // 发送失败，保持输入框不关闭
  }
}

// 点赞通知中的评论
async function likeNoticeComment(notice: MessageNotice) {
  if (!userStore.isLogin || !notice.bizId) return
  const currentlyLiked = noticeLikedMap.value[notice.id]
  try {
    await post(`${COMMENT_API.TOGGLE_LIKE}/${notice.bizId}`)
    noticeLikedMap.value[notice.id] = !currentlyLiked
  } catch {
    // ignore
  }
}

// 删除前统一确认弹窗：确认返回 true，取消返回 false
async function confirmDeleteNotice(): Promise<boolean> {
  try {
    await ElMessageBox.confirm('删除该条通知后将无法恢复，是否继续？', '删除确认', {
      confirmButtonText: '继续',
      cancelButtonText: '取消',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

// 删除单条通知（调用后端真实删除）
async function deleteNotice(notice: MessageNotice) {
  if (!(await confirmDeleteNotice())) return
  await messageStore.deleteNotice(notice.id)
}

// 点击整行：新开标签页跳转到关联视频（评论/点赞类通知通过 extJson.videoId 跳转到所属视频）
// 携带 commentId 参数以便视频页自动滚动到目标评论并高亮
// 注意：window.open 必须在点击同步栈内执行，故先开新页，再异步标记已读（避免 await 后弹窗被拦截）
function goNoticeTarget(notice: MessageNotice) {
  // 动态类通知：新标签页打开动态详情页（/dynamic/:id）
  if (notice.bizType === 'dynamic') {
    // 动态@通知（发布动态时）bizId 即动态id；动态评论通知 bizId 是评论id，动态id 在 extJson.dynamicId
    const dynamicId = noticeExt(notice).dynamicId || notice.bizId
    if (!dynamicId) return
    const query: Record<string, string> = {}
    // 评论/回复/@类通知 bizId 指向具体评论，供详情页定位（动态点赞通知 bizId 是动态id，不携带）
    if (notice.bizId && (notice.noticeType === 'comment' || notice.noticeType === 'reply' || notice.noticeType === 'at')) {
      query.commentId = String(notice.bizId)
    }
    const href = router.resolve({path: `/dynamic/${dynamicId}`, query}).href
    window.open(href, '_blank')
    if (notice.isRead === 0) {
      messageStore.markNoticeRead(notice.id).catch(() => {
      })
    }
    return
  }
  const videoId = noticeExt(notice).videoId
  if (!videoId) return
  const query: Record<string, string> = {}
  // 回复/点赞/@ 三类通知的 bizId 均指向具体评论，用于视频页滚动定位到该评论
  if (notice.bizId && (notice.noticeType === 'reply' || notice.noticeType === 'at' || notice.noticeType === 'like')) {
    query.commentId = String(notice.bizId)
  }
  const href = router.resolve({path: `/video/${videoId}`, query}).href
  window.open(href, '_blank')
  // 标记已读（不阻塞新页面打开，失败忽略）
  if (notice.isRead === 0) {
    messageStore.markNoticeRead(notice.id).catch(() => {
    })
  }
}

// 提取通知触发者信息，避免在 v-if 嵌套插值里触发 Volar 对 actorUser 的误缩窄
function actorName(notice: MessageNotice): string {
  return getUserDisplayName(notice.actorUser, '')
}

function actorUid(notice: MessageNotice): number {
  return notice.actorUser?.uid ?? 0
}

// 点击头像/用户名：新开标签页跳转到用户空间
function goUserSpace(uid: number) {
  if (!uid) return
  const href = router.resolve({path: `/space/${uid}`}).href
  window.open(href, '_blank')
}

// 点击分组卡片：跳转到点赞详情路由 /like/:bizType/:bizId（路径变化、可回退、可刷新）
function goLikeDetail(bizType: string, bizId: number | null) {
  router.push(`/like/${bizType}/${bizId ?? 0}`)
}

// 删除点赞分组的所有通知
async function deleteLikeGroup(group: LikeGroup) {
  if (!(await confirmDeleteNotice())) return
  for (const notice of group.notices) {
    await messageStore.deleteNotice(notice.id)
  }
}

// 不再通知（删除该分组全部通知，语义同删除）
async function muteLikeGroup(group: LikeGroup) {
  await deleteLikeGroup(group)
}

watch(() => currentMessages.value.length, async () => {
  // 用户在底部或首次加载时，自动滚到底部
  if (scrolledToBottom.value || currentMessages.value.length <= 1) {
    await nextTick()
    await scrollChatToBottom()
  }
})

// WebSocket 是主通道；无论其状态如何，当前会话都用低频补拉兜底，
// 以处理“连接已建立但推送丢失”的情况。
watch(currentSessionId, (sessionId) => {
  if (disconnectedChatRefreshTimer) {
    clearInterval(disconnectedChatRefreshTimer)
    disconnectedChatRefreshTimer = null
  }
  if (!sessionId) return

  disconnectedChatRefreshTimer = setInterval(() => {
    if (!messageStore.wsConnected && messageStore.currentSessionId === sessionId && !messageStore.currentMessagesLoading) {
      messageStore.fetchSessionMessages(sessionId)
    }
  }, 5000)
}, {immediate: true})

onBeforeUnmount(() => {
  if (disconnectedChatRefreshTimer) clearInterval(disconnectedChatRefreshTimer)
  if (messageListRefreshTimer) clearInterval(messageListRefreshTimer)
})

onMounted(async () => {
  if (!userStore.isLogin) {
    await router.replace('/');
    return
  }
  // WS 连接由 App.vue 全局管理（startLoggedInInit），这里不再重复连接。
  // 会话列表与未读汇总也由 App.vue 初始化 + WS onopen 补偿保证最新，
  // 消息页 mounted 不再重复拉取；仅当路由带 uid 参数时由 syncSessionFromRoute 处理。
  await syncSessionFromRoute()

  // 列表级兜底同步：保证未关注人汇总入口、摘要和红点无需手动刷新页面。
  messageListRefreshTimer = setInterval(() => {
    // WebSocket 正常时由 SESSION_UPDATED/UNREAD_UPDATED 实时驱动，禁止额外 XHR。
    if (!messageStore.wsConnected && !messageStore.followSessionsLoading && !messageStore.strangerSessionsLoading) {
      messageStore.fetchSessions()
      messageStore.fetchUnreadSummary()
    }
  }, 10000)

})

watch(() => route.fullPath, () => {
  syncSessionFromRoute()
})
</script>

<style scoped lang="less">
@bg: #e9f4f8;
@border: #e8edef;
@pink-light: #fff0f4;
@pink-hover: #fc8bab;
@blue-light: #e8f6fc;

.message-page {
  position: relative;
  height: calc(100vh - 64px);
  background: @bg;
  overflow: hidden;
}

.bg-clouds {
  position: absolute;
  left: -40px;
  bottom: -30px;
  width: 460px;
  pointer-events: none;
}

.msg-card {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 14px rgba(23, 35, 61, 0.06);
}

// ======================== 顶部标题栏 ========================
.card-head {
  flex: 0 0 100%;
  height: 50px;
  display: flex;
  border-bottom: 1px solid @border;

  .head-logo {
    width: 150px;
    min-width: 150px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 20px;
    color: @text-1;
    font-size: 15px;
    font-weight: 600;

    .logo-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
    }
  }

  .head-title {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-size: 15px;
    color: @text-2;
    background: #fff;

    .crumb-link {
      cursor: pointer;
      color: @text-2;
      font-weight: 400;

      &:hover {
        color: @blue;
      }
    }

    .crumb-sep {
      margin: 0 6px;
      color: @text-3;
      font-weight: 400;
    }
  }
}

// ======================== 左侧导航 ========================
.msg-side {
  width: 150px;
  min-width: 150px;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  border-right: 1px solid @border;
  background: #f7f9fb;

  .side-menu {
    flex: 1;
    margin: 0;
    padding: 10px 0;
    list-style: none;
  }

  .side-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    font-size: 14px;
    color: @text-2;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    user-select: none;

    &:hover {
      color: @blue;

      .item-dot {
        background: @blue;
      }
    }

    &.active {
      color: @blue;

      .item-dot {
        background: @blue;
      }
    }

    .item-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #c9cdd4;
      flex-shrink: 0;
      transition: background 0.15s;
    }

    .item-label {
      flex: 1;
    }

    .item-badge {
      font-style: normal;
      background: @pink;
      color: #fff;
      font-size: 11px;
      min-width: 18px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 8px;
      padding: 0 5px;
    }
  }

  .side-footer {
    border-top: 1px solid @border;
    padding: 6px 0;

    .setting {
      display: flex;
      font-size: 13px;

      .setting-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }
}

// ======================== 中间列表 ========================
.msg-list {
  width: 300px;
  min-width: 300px;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;

  .list-breadcrumb {
    padding: 10px 16px 6px;
    font-size: 13px;
    color: #86909c;
    user-select: none;
    flex-shrink: 0;

    .breadcrumb-link {
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #1d7dfa;
      }
    }

    .breadcrumb-sep {
      margin: 0 4px;
    }

    .breadcrumb-current {
      color: #1d2129;
    }
  }

  border-right: 1px solid @border;
  background: #fff;

  .list-title {
    font-size: 15px;
    font-weight: 600;
    color: @text-1;

    &.sub {
      font-size: 13px;
      font-weight: 400;
      color: @text-2;
    }

    &.breadcrumb {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      button {
        border: 0;
        padding: 0;
        background: transparent;
        color: @text-2;
        font: inherit;
        cursor: pointer;

        &:hover {
          color: @pink;
        }
      }

      i {
        font-style: normal;
        color: @text-3;
      }
    }
  }

  .mark-read-btn {
    border: none;
    background: transparent;
    font-size: 12px;
    color: @blue;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: @blue-light;
    }
  }

  .list-scroll {
    flex: 1;
    overflow-y: auto;
  }
}

.list-empty {
  text-align: center;
  padding: 40px 16px;
  color: @text-3;
  font-size: 13px;
}

// 会话行
.session-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 12px 34px;
  position: relative;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: #f7f8f9;

    .ses-delete-btn {
      opacity: 1;
    }
  }

  &.active {
    background: #edf3f9;

    .ses-delete-btn {
      opacity: 1;
    }
  }

  .ses-delete-btn {
    position: absolute;
    left: 7px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    .flex-center();
    border: none;
    background: transparent;
    color: #c9cdd4;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s, background 0.15s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      color: #ef5350;
      background: #fef0f1;
    }
  }

  .ses-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .ses-body {
    flex: 1;
    min-width: 0;
  }

  .ses-name {
    margin: 0 0 4px;
    font-size: 14px;
    color: @text-1;
    .ellipsis();
  }

  .ses-preview {
    margin: 0;
    font-size: 12px;
    color: @text-3;
    .ellipsis();
  }

  .ses-badge {
    font-style: normal;
    background: @pink;
    color: #fff;
    font-size: 11px;
    min-width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    border-radius: 9px;
    padding: 0 5px;
    flex-shrink: 0;
  }

  .stranger-entry-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    .flex-center();
    flex-shrink: 0;
    background: #e3f2fa;
    color: @blue;

    svg {
      width: 23px;
      height: 23px;
    }
  }

  .stranger-unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: @pink;
    flex-shrink: 0;
  }
}

// 通知行
.notice-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid #f4f6f7;

  &:hover {
    background: #f7f8f9;
  }

  &.unread {
    background: #f2f9fd;

    &:hover {
      background: #e7f4fb;
    }
  }

  .ntc-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .ntc-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    .flex-center();
    flex-shrink: 0;
    color: #fff;

    svg {
      width: 22px;
      height: 22px;
    }

    &.reply {
      background: linear-gradient(135deg, #a8d4fe, #6db3f2);
    }

    &.at {
      background: linear-gradient(135deg, #fbc2eb, #a18cd1);
    }

    &.like {
      background: linear-gradient(135deg, #ffecd2, #fcb69f);
    }

    &.system {
      background: linear-gradient(135deg, #d4fc79, #96e6a1);
    }
  }

  .ntc-body {
    flex: 1;
    min-width: 0;
  }

  .ntc-title {
    margin: 0;
    font-size: 13px;
    color: @text-1;
    line-height: 1.5;
    .ellipsis();

    .ntc-actor {
      color: @blue;
      margin-right: 4px;
    }
  }

  .ntc-summary {
    margin: 3px 0 0;
    font-size: 12px;
    color: @text-3;
    .ellipsis();
  }

  .ntc-time {
    font-size: 11px;
    color: #c9cdd4;
    margin-top: 3px;
    display: block;
  }

  .ntc-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: @pink;
    flex-shrink: 0;
    margin-top: 8px;
  }
}

// 通知卡片（回复/@/赞 通用 B 站风格）
.ntc-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
  border-bottom: 1px solid #f4f6f7;

  &:hover {
    background: #f7f8f9;
  }

  &.unread {
    background: #f2f9fd;

    &:hover {
      background: #e7f4fb;
    }
  }

  &--active {
    background: #eef6fc;

    .ntc-avatar-link,
    .ntc-actor {
      opacity: 0.85;
    }
  }

  .ntc-avatar-link {
    flex-shrink: 0;
    text-decoration: none;

    &:hover .ntc-avatar {
      opacity: 0.85;
    }
  }

  .ntc-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .ntc-main {
    flex: 1;
    min-width: 0;
  }

  .ntc-line {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: @text-2;

    .ntc-actor {
      color: @blue;
      font-weight: 600;
      margin-right: 4px;
      cursor: pointer;

      &:hover {
        color: @pink;
      }
    }

    .ntc-action {
      color: @text-1;
    }
  }

  .ntc-reply-line {
    margin: 6px 0 0;
    font-size: 13px;
    color: @text-1;
    line-height: 1.5;
    word-break: break-word;
  }

  .ntc-quote {
    margin: 6px 0 0;
    padding: 8px 10px;
    background: #f6f7f8;
    border-radius: 6px;
    font-size: 13px;
    color: @text-1;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .ntc-foot {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 8px;
  }

  .ntc-time {
    font-size: 11px;
    color: #c9cdd4;
  }

  .ntc-act {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    padding: 2px 4px;
    font-size: 12px;
    color: @text-2;
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;

    svg {
      width: 15px;
      height: 15px;
    }

    &:hover {
      color: @pink;
      background: @pink-light;
    }
  }

  // 右侧缩略图 / 跳转块
  .ntc-thumb {
    width: 84px;
    height: 56px;
    min-width: 84px;
    border-radius: 6px;
    overflow: hidden;
    .flex-center();
    background: linear-gradient(135deg, #e8f1f8, #d7e6f2);
    text-decoration: none;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ntc-thumb-text {
      font-size: 12px;
      color: @blue;
      text-align: center;
      line-height: 1.4;
    }

    &--link {
      cursor: pointer;
    }

    // 文字缩略图：评论区回复 @我 时展示根评论内容
    &--text {
      width: 84px;
      height: 60px;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 6px 8px;
      background: #f4f5f7;
      color: @text-2;
      font-size: 12px;
      line-height: 1.4;
      text-align: left;
      cursor: pointer;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }
  }

  .ntc-dot {
    position: absolute;
    top: 18px;
    right: 14px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: @pink;
    flex-shrink: 0;
  }

  // 内联回复输入框 - 使用 flex: 0 0 100% 确保在父级 flex 容器中占满整行
  .ntc-reply-box {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #eef1f3;
    flex: 0 0 100%; // 关键修复：在 flex 父容器中占满整行宽度
    animation: ntc-reply-slide-in 0.2s ease-out;

    .ntc-reply-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      object-fit: cover;
    }

    .ntc-reply-editor {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ntc-reply-input {
      width: 100%;
      min-height: 60px;
      max-height: 140px;
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.6;
      color: @text-1;
      background: #fff;
      border: 1px solid #c9cdd4;
      border-radius: 6px;
      resize: vertical;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;

      &::placeholder {
        color: #c9cdd4;
        font-size: 12px;
      }

      &:focus {
        border-color: @blue;
        box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.15);
      }
    }

    .ntc-reply-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}

@keyframes ntc-reply-slide-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ======================== 右侧详情 ========================
.msg-main {
  flex: 1;
  min-width: 0;
  height: calc(100% - 50px);
  display: flex;
  flex-direction: column;
  background: #fff;
}

// 通知模式：通知列表直接展示在 msg-main 内
.notice-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.35);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

// 聊天框
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-top {
  .flex-center();
  min-height: 44px;
  padding: 0 20px;
  border-bottom: 1px solid @border;
  flex-shrink: 0;
  background: #fff;
  position: relative;
  z-index: 10;

  .chat-top-name {
    font-size: 15px;
    font-weight: 500;
    color: @text-1;
  }

  .chat-more-wrap {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
  }

  .chat-more-btn {
    width: 28px;
    height: 28px;
    .flex-center();
    color: #8d98a5;
    border-radius: 4px;
    border: none;
    background: none;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: #f3f5f7;
      color: @text-2;
    }
  }

  .chat-menu-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    min-width: 160px;
    padding: 4px 0;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    background: #fff;
    border: 1px solid @border;

    &::before {
      content: '';
      position: absolute;
      top: -5px;
      right: 50%;
      margin-right: -5px;
      width: 10px;
      height: 10px;
      background: #fff;
      border-left: 1px solid @border;
      border-top: 1px solid @border;
      transform: rotate(45deg);
    }

    .menu-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 9px 16px;
      font-size: 14px;
      line-height: 1.4;
      color: @text-1;
      border: none;
      background: none;
      cursor: pointer;
      white-space: nowrap;
      position: relative;

      &:hover {
        background: #f5f6f7;
      }

      .menu-sub {
        display: block;
        font-size: 11px;
        color: @text-3;
        margin-top: 1px;
      }
    }
  }
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f5f6f7;
  min-height: 0;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.35);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.chat-load-top {
  align-self: center;
  .flex-center();
  gap: 6px;
  padding: 10px 0;
  color: @text-3;
  font-size: 12px;

  .load-spinner {
    width: 24px;
    height: 24px;
    animation: chat-spin-dots 0.75s linear infinite;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .load-tip {
    white-space: nowrap;
  }
}

@keyframes chat-spin-dots {
  to {
    transform: rotate(360deg);
  }
}

.chat-time-divider {
  text-align: center;
  color: @text-3;
  font-size: 12px;
  pointer-events: none;
}

.msg-bubble-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 76%;
  position: relative;

  &.me {
    align-self: flex-end;

    .msg-bubble {
      background: @blue;
      color: #fff;
      border-radius: 12px 2px 12px 12px;
    }

    .msg-failed {
      background: #ffebee;
      border-color: #ef5350;
    }
  }

  &.failed {
    .msg-bubble {
      border-color: #ef5350;
    }
  }

  .msg-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .msg-avatar-link {
    flex-shrink: 0;
    text-decoration: none;

    &:hover .msg-avatar {
      opacity: 0.85;
    }
  }

  .msg-bubble {
    background: #fff;
    border-radius: 2px 12px 12px 12px;
    padding: 10px 15px;
    min-width: 40px;
    box-shadow: none;
    border: 0;
    position: relative;

    .msg-text {
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .msg-failed-label {
      display: block;
      font-size: 11px;
      color: #ef5350;
      margin-top: 4px;
      text-align: right;
    }

    &.msg-failed {
      background: #ffebee;
      border-color: #ef5350;
      cursor: pointer;
      opacity: 0.85;

      .msg-failed-label {
        color: #ef5350;
      }

      &:hover {
        opacity: 1;
      }
    }
  }

  .msg-sending-dot {
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: @blue;
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  50% {
    opacity: 0.4;
    transform: translateY(-50%) scale(0.8);
  }
}

.chat-empty {
  .flex-center();
  height: 100%;
  color: @text-3;
  font-size: 14px;
}

// 输入区
.chat-foot {
  border-top: 1px solid @border;
  padding: 12px 20px 18px;
  flex-shrink: 0;
  background: #fff;
}

.chat-tools {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 30px;

  button {
    .flex-center();
    padding: 0;
    border: 0;
    background: transparent;
    color: #94a1ad;
    cursor: pointer;

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover {
      color: @blue;
    }
  }
}

.chat-textarea {
  width: 100%;
  min-height: 74px;
  max-height: 160px;
  border: 0;
  border-radius: 0;
  padding: 7px 0;
  font-size: 14px;
  line-height: 1.6;
  color: @text-1;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: background 0.2s;

  &::placeholder {
    color: @text-3;
  }
}

.chat-submit-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  margin-top: 8px;

  .chat-hint {
    font-size: 12px;
    color: #c9cdd4;
  }

  .send-btn {
    height: 36px;
    min-width: 90px;
    padding: 0 20px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    color: #606266;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      color: @blue;
      border-color: @blue;
    }

    &:disabled {
      background: #f5f6f7;
      border-color: #e4e7ed;
      color: #c0c4cc;
      cursor: not-allowed;
    }
  }
}

// ======================== 空状态插画 ========================
.empty-state {
  flex: 1;
  .flex-center-col();
  gap: 16px;
  height: 100%;
}

.empty-art {
  width: 360px;
  max-width: 80%;

  svg {
    width: 100%;
    height: auto;
  }
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: @text-3;
}

.empty-sub {
  margin: 0;
  font-size: 13px;
  color: #c9cdd4;
}

// 响应式
@media (max-width: 900px) {
  .msg-side {
    display: none;
  }

  .card-head .head-logo {
    display: none;
  }

  .msg-list {
    width: 260px;
    min-width: 260px;
  }
}

// 聊天菜单下拉过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top right;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

// ==================== 点赞分组卡片样式 ====================
.like-group-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
  border-bottom: 1px solid #f4f6f7;

  &:hover {
    background: #f7f8f9;
  }

  &.unread {
    background: #f2f9fd;

    &:hover {
      background: #e7f4fb;
    }
  }
}

.like-avatars {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}

.like-avatar-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #fff;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
  background-color: #fff;
  box-sizing: border-box;

  &:hover {
    transform: scale(1.08);
    z-index: 10 !important;
  }
}

/* 有两个头像时：左大（36x36 左上）、右小（32x32 右下，层级更高） */
.like-avatars--two {
  .like-avatar-wrap:nth-child(1) {
    width: 36px;
    height: 36px;
    top: 0;
    left: 0;
    right: auto;
    bottom: auto;
    z-index: 1;
  }

  .like-avatar-wrap:nth-child(2) {
    width: 32px;
    height: 32px;
    top: auto;
    left: auto;
    right: 0;
    bottom: 0;
    z-index: 2;
  }
}

.like-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.like-body {
  flex: 1;
  min-width: 0;
}

.like-title {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: @text-2;

  .like-name {
    color: @blue;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      color: @pink;
    }
  }

  .like-summary {
    margin-left: 8px;
    color: @text-1;
  }
}

.like-foot {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
}

.like-time {
  font-size: 11px;
  color: #c9cdd4;
}

.like-act {
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  color: @text-2;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: @pink;
    background: @pink-light;
  }
}

.like-right {
  flex-shrink: 0;
  width: 84px;
  height: 62px;
  border-radius: 6px;
  overflow: hidden;
}

.like-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.like-cover-placeholder {
  .flex-center();
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8f1f8, #d7e6f2);
  font-size: 12px;
  color: @blue;
  cursor: pointer;
}

.like-comment-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 12px;
  color: @text-2;
  line-height: 1.5;
  padding: 6px 8px;
  background: #f6f7f8;
  border-radius: 6px;
  cursor: pointer;
  word-break: break-word;

  &:hover {
    color: @blue;
  }
}
</style>
