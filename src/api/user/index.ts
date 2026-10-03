export enum USER_API {
  USER_LOGIN = "/user/login",
  USER_REGISTER = "/user/register",
  USER_LOGOUT = "/user/logout",
  USER_INFO = "/user/info",
  GET_SEARCH_USER = "/user/search",
  // 自助更新公开资料（昵称/头像/背景/性别/签名）
  USER_PROFILE = "/user/profile",
  // 真拉黑（user_block 表，私信双向拦截）
  USER_BLOCK_LIST = "/user/block/list",
  USER_BLOCK = "/user/block",
  USER_BLOCK_STATUS = "/user/block/status",
  // 双向拉黑关系（blockedByMe / blockingMe），供 space 页互访拦截
  USER_BLOCK_RELATION = "/user/block/relation",
  // 今日每日奖励完成情况（login/watch/vip_watch/share/coin 各自已获得经验）
  USER_EXP_DAILY = "/user/exp/daily",
}
