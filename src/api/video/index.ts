export enum VIDEO_API {
  GET_RECOMMEND_VIDEO = "/video/recommend",
  GET_BY_ID = "/video",
  GET_SEARCH_VIDEO = "/video/search",
  REPORT_PLAY = "/video/play", // 上报播放量
  HEARTBEAT = "/video/heartbeat", // 在线观众心跳
  GET_BY_UID = "/video/user", // 按 uid 获取用户投稿视频
}
