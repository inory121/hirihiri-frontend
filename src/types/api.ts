// 基础响应接口
export interface BaseResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// Category接口
export interface Category {
  value: string
  label: string
  children: {
    value: string
    label: string
    rcmTag: string[]
  }[]
}

// SubCategory接口
export interface SubCategory {
  rcmTag: string[]
  descr: string
  mcId: string
  mcName: string
  scId: string
  scName: string
  cid: number
}

// MainCategory接口
interface MainCategory {
  mcId: string
  mcName: string
  scList: SubCategory[]
}

export interface CategoryApiResponse extends BaseResponse {
  data: MainCategory[]
}

// Video接口
export interface Video {
  auth: number
  coverUrl: string
  delDate: string
  descr: string
  duration: number
  mcId: string
  createTime: string
  scId: string
  status: number
  tags: string
  title: string
  type: number
  uid: number
  vid: number
  videoUrl: string
  coverColor?: string
  isTop?: number
}

export interface VideoInfo {
  category: SubCategory
  video: Video
  stat: VideoStat
  user: User
}

export interface VideoStat {
  vid: number
  view: number
  danmaku: number
  reply: number
  favorite: number
  coin: number
  share: number
  like: number
  dislike: number
}

export interface VideoApiResponse extends BaseResponse {
  data: VideoInfo[]
}

export interface OneVideoApiResponse extends BaseResponse {
  data: VideoInfo
}

export interface FavoriteFolder {
  id: number
  uid: number
  name: string
  coverUrl?: string
  description?: string
  videoCount: number
  isDefault: boolean
  createTime: string
  updateTime: string
  collected?: boolean
}

export interface FavoriteFolderApiResponse extends BaseResponse {
  data: FavoriteFolder[]
}

export interface FavoriteFolderItemApiResponse extends BaseResponse {
  data: FavoriteFolder
}

export interface FavoriteVideoPage {
  records: VideoInfo[]
  total: number
  size: number
  current: number
  pages: number
}

export interface FavoriteVideoPageApiResponse extends BaseResponse {
  data: FavoriteVideoPage
}

export interface FavoriteVideoListApiResponse extends BaseResponse {
  data: VideoInfo[]
}

export interface Danmu {
  id?: number
  vid: number
  uid: number
  content: string
  fontsize: number
  mode: 1 | 2 | 3 | 4
  color: string
  time: number
  state: number
  createTime?: string
}

export interface DanmakuApiResponse extends BaseResponse {
  data: Danmu[]
}

export interface oneDanmakuApiResponse extends BaseResponse {
  data: Danmu
}

export interface Comment {
  id?: number
  vid: number
  dynamicId?: number | null
  uid: number
  user?: User
  toUser?: User
  replies?: Comment[]
  rootId: number
  parentId: number
  toUserId: number
  content: string
  // 评论中 @ 的用户列表（后端解析 @uid 返回），前端据此零请求渲染可点击 @提及
  mentionUsers?: Array<{ uid: number; username: string; nickname?: string; avatar?: string }>
  like?: number
  dislike?: number
  liked?: boolean
  disliked?: boolean
  upLiked?: boolean
  createTime?: string
  isTop?: number
  isDeleted?: number
}

export interface CommentApiResponse extends BaseResponse {
  data: CommentPageData
}

export interface CommentPageData {
  comments: Comment[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface oneCommentApiResponse extends BaseResponse {
  data: Comment
}

// User接口
export interface User {
  auth: number
  authMsg: string
  avatar: string
  background: string
  coin: number
  createTime: string
  description: string
  exp: number
  nickname: string
  sex: number
  uid: number
  username: string
  vip: number
  level?: number
  fanCount?: number
  videoCount?: number
  like?: number
  isFollowing?: boolean
}

export interface UserData {
  user: User
  token: string
}

export interface UserDataApiResponse extends BaseResponse {
  data: UserData
}

export interface UserApiResponse extends BaseResponse {
  data: User
}

// ======================== 动态系统类型 ========================

// 动态（feed）对象
export interface Dynamic {
  id: number
  uid: number
  title: string
  content: string
  type: 0 | 1 | 2 | 3 // 0 普通动态 1 分享视频 2 投稿视频 3 转发动态
  vid: number | null
  parentId: number | null
  images: string[]
  isTop: number
  createTime: string
  likeCount?: number // 点赞数（列表接口批量回填）
  liked?: boolean // 当前用户是否已点赞
  commentCount?: number // 评论数（列表接口批量回填）
  repostCount?: number // 转发数（列表接口批量回填）
  user?: User
  // 视频动态时返回 { video, stat, user }
  video?: { video: Video; stat: VideoStat; user?: User } | null
  // 转发动态（type=3）时返回被转发的原动态完整数据
  parent?: Dynamic | null
  // 是否未读（动态弹窗 unread-list 接口返回：关注的UP主新投稿）
  unread?: boolean
}

// 发布动态请求参数
export interface DynamicPublishPayload {
  title?: string
  content?: string
  type?: 0 | 1 | 2 | 3
  vid?: number | null
  parentId?: number | null
  images?: string[]
}

// 动态分页结果
export interface DynamicPageData {
  records: Dynamic[]
  total: number
}

export interface DynamicPageApiResponse extends BaseResponse {
  data: DynamicPageData
}

// 动态详情响应（单条）
export interface DynamicApiResponse extends BaseResponse {
  data: Dynamic
}

// 动态「赞与转发」用户列表单项：user 为互动用户，action 区分点赞/转发
export interface DynamicInteraction {
  user: User
  action: 'like' | 'repost'
  time: string
}

// 动态「赞与转发」分页数据（赞与转发分开计数、不去重，同一用户既赞又转发会有两条）
export interface DynamicInteractionPage {
  records: DynamicInteraction[]
  total: number
  likeCount: number
  repostCount: number
}

export interface DynamicInteractionApiResponse extends BaseResponse {
  data: DynamicInteractionPage
}

// 发过动态的UP主
export interface DynamicUp {
  uid: number
  dynamicCount: number
  latestTime: string
  user?: User
}

// UP主分页结果
export interface DynamicUpPageData {
  records: DynamicUp[]
  total: number
}

export interface DynamicUpPageApiResponse extends BaseResponse {
  data: DynamicUpPageData
}
// 浏览历史接口
export interface HistoryVideoDTO {
  id: number
  vid: number
  browseTime: string
  progress: number
  title: string
  coverUrl: string
  duration: number
  authorUid: number
  authorUsername: string
}

export interface HistoryApiResponse extends BaseResponse {
  data: HistoryVideoDTO[]
}

export interface FollowCount {
  followers: number
  followings: number
}

export interface FollowCountApiResponse extends BaseResponse {
  data: FollowCount
}

export interface FollowStatusApiResponse extends BaseResponse {
  data: boolean
}

export interface FollowListApiResponse extends BaseResponse {
  data: User[]
}

// 推荐流 DTO
export interface RecommendFeedDTO {
  items: VideoInfo[]
  nextCursor: string | null
  requestId: string
}

// 推荐行为事件
export interface RecommendEvent {
  eventId: string
  vid: number
  eventType: 'impression' | 'click' | 'watch_progress' | 'dislike'
  requestId?: string
  scene?: string
  position?: number
  watchSeconds?: number
  progressRatio?: number
  eventTime?: string
}

// 推荐反馈响应
export interface RecommendFeedbackResponse extends BaseResponse {
  data: string
}

// ======================== 消息系统类型 ========================

export interface MessagePeerUser {
  uid: number
  username: string
  nickname: string
  avatar: string
}

export interface MessageUnread {
  totalUnread: number
  privateUnread: number
  strangerUnread: number
  replyUnread: number
  atUnread: number
  likeUnread: number
  systemUnread: number
  // 动态未读数（关注的UP主新投稿，仅驱动头部动态红点，不计入 totalUnread）
  dynamicUnread: number
}

export interface MessageSession {
  sessionId: number
  peerUser: MessagePeerUser
  lastMessage: string | null
  lastMessageTime: string | null
  unreadCount: number
  following: boolean
}

export interface MessagePrivateMessage {
  id: number
  sessionId: number
  senderUid: number
  receiverUid: number
  content: string
  contentType: string
  isRead: number
  createTime: string
  readTime: string | null
  senderUser: MessagePeerUser
  /** 客户端生成的临时消息 ID，用于乐观更新精确替换 */
  clientMessageId?: string
  /** 消息发送状态 */
  status?: 'sending' | 'sent' | 'failed'
}

export interface MessageNotice {
  id: number
  receiveUid: number
  noticeType: 'reply' | 'at' | 'like' | 'system'
  bizType: string | null
  bizId: number | null
  title: string
  contentSummary: string | null
  isRead: number
  extJson: string | null
  createTime: string
  actorUser: MessagePeerUser | null
}

// API 响应类型
export interface MessageUnreadApiResponse extends BaseResponse {
  data: MessageUnread
}

export interface MessageSessionListApiResponse extends BaseResponse {
  data: MessageSession[]
}

export interface MessageSessionItemApiResponse extends BaseResponse {
  data: MessageSession
}

export interface MessagePrivateListApiResponse extends BaseResponse {
  data: MessagePrivateMessage[]
}

export interface MessagePrivateItemApiResponse extends BaseResponse {
  data: MessagePrivateMessage
}

export interface MessageNoticeListApiResponse extends BaseResponse {
  data: MessageNotice[]
}
