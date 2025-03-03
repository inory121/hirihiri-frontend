// 基础响应接口
export interface BaseResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// Category接口
interface SubCategory {
  rcmTag: string[]
  descr: string
  mcId: string
  scId: string
  scName: string
  cid: number
}

interface MainCategory {
  mcId: string
  mcName: string
  scList: SubCategory[]
}

export interface CategoryApiResponse extends BaseResponse{
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
  pubDate: string
  scId: string
  status: number
  tags: string[]
  title: string
  type: number
  uid: number
  vid: number
  videoUrl: string
}

export interface VideoApiResponse extends BaseResponse{
  data: Video[]
}
export interface OneVideoApiResponse extends BaseResponse{
  data: Video
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
}

export interface UserData {
  user: User
  token: string
}

export interface UserDataApiResponse extends BaseResponse{
  data: UserData
}

export interface UserApiResponse extends BaseResponse{
  data: User
}
