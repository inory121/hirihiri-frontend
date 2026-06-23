export enum VIDEO_API {
  GET_RECOMMEND_VIDEO = "/video/recommend",
  GET_BY_ID = "/video",
  GET_SEARCH_VIDEO = "/video/search",
  REPORT_PLAY = "/video/play", // 上报播放量
  HEARTBEAT = "/video/heartbeat", // 在线观众心跳
  GET_BY_UID = "/video/user", // 按 uid 获取用户投稿视频
  // 视频互动
  TOGGLE_LIKE = "/video/interaction/like", // 点赞/取消点赞
  TOGGLE_COIN = "/video/interaction/coin", // 投币/取消投币
  TOGGLE_COLLECT = "/video/interaction/collect", // 收藏/取消收藏
  GET_INTERACTION_STATUS = "/video/interaction/status", // 获取互动状态
}
