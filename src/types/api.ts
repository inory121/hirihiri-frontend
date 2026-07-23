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
  createDate: string
  scId: string
  status: number
  tags: string
  title: string
  type: number
  uid: number
  vid: number
  videoUrl: string
  dominantColor?: [number, number, number]
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
  createDate?: string
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
  uid: number
  user?: User
  toUser?: User
  replies?: Comment[]
  rootId: number
  parentId: number
  toUserId: number
  content: string
  like?: number
  dislike?: number
  liked?: boolean
  disliked?: boolean
  upLiked?: boolean
  createDate?: string
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
  createDate: string
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
export interface searchUserApiResponse extends BaseResponse {
  data: SearchUserItem[]
}

export interface SearchUserItem extends User {
  level: number
  fanCount: number
  videoCount: number
  isFollowing: boolean
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
