export enum DYNAMIC_API {
  PUBLISH = "/dynamic/publish", // 发布动态
  LIST = "/dynamic/list", // 分页获取动态列表
  UP_LIST = "/dynamic/up-list", // 分页获取发过动态的UP主列表
  DELETE = "/dynamic/delete", // 删除动态
  LIKE = "/dynamic/like", // 点赞/取消点赞动态
  UNREAD_LIST = "/dynamic/unread-list", // 未读动态列表（关注的UP主新投稿，带 unread 标记）
  DETAIL = "/dynamic", // 动态详情（拼接 /{dynamicId}）
  INTERACTIONS = "/dynamic", // 动态赞与转发用户列表（拼接 /{dynamicId}/interactions）
}
