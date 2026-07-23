export enum VIDEO_API {
  TOGGLE_DISLIKE = "/video/interaction/dislike",
  COLLECT_TO_FOLDER = "/video/interaction/collect",
  GET_RECENT_COINS = "/video/interaction/recent/coins",
  GET_RECENT_LIKES = "/video/interaction/recent/likes",
  GET_FAVORITE_FOLDERS = "/favorite/folders",
  CREATE_FAVORITE_FOLDER = "/favorite/folder",
  UPDATE_FAVORITE_FOLDER = "/favorite/folder",
  DELETE_FAVORITE_FOLDER = "/favorite/folder",
  GET_FOLDER_VIDEOS = "/favorite/folder",
  GET_RECOMMEND_VIDEO = "/video/recommend",
  GET_BY_ID = "/video",
  GET_SEARCH_VIDEO = "/video/search",
  GET_SEARCH_SUGGEST = "/video/search/suggest",
  GET_HOT_SEARCH = "/video/search/hot",
  REPORT_PLAY = "/video/play", // 上报播放量
  HEARTBEAT = "/video/heartbeat", // 在线观众心跳
  GET_BY_UID = "/video/user", // 按 uid 获取用户投稿视频
  GET_PINNED = "/video/pinned", // 获取用户置顶视频
  SET_PINNED = "/video/pinned/set", // 设置置顶视频
  CANCEL_PINNED = "/video/pinned/cancel", // 取消置顶视频
  // 视频互动
  TOGGLE_LIKE = "/video/interaction/like", // 点赞/取消点赞
  TOGGLE_COIN = "/video/interaction/coin", // 投币/取消投币
  TOGGLE_COLLECT = "/video/interaction/collect", // 收藏/取消收藏
  GET_INTERACTION_STATUS = "/video/interaction/status", // 获取互动状态
}
