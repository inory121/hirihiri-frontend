// OSS 静态资源地址常量（统一管理外链，换 bucket / CDN 域名时只改这里）
export const OSS_BASE = 'https://hirihiri2.oss-cn-shanghai.aliyuncs.com'

/** 默认头像（小电视，无头像兜底） */
export const DEFAULT_AVATAR = `${OSS_BASE}/up_pb.svg`

/** 无脸默认头像（评论区） */
export const DEFAULT_NOFACE_AVATAR = `${OSS_BASE}/noface.jpg`

/** 用户空间默认背景图 */
export const DEFAULT_BACKGROUND = `${OSS_BASE}/background.png`

/** 收藏夹默认封面 */
export const DEFAULT_FOLDER_COVER = `${OSS_BASE}/b8eb9637fec90527a6dc9737acdc3577e275c7b5.png`

/** 站点 logo（频道栏 / 创作中心） */
export const SITE_LOGO = `${OSS_BASE}/05b340832a490209f185542bb9690fc748bc08f7.png`

/** 频道"热"角标 */
export const HOT_ICON = `${OSS_BASE}/hot.svg`

/** 动态页"全部"图标 */
export const ALL_DYNAMIC_ICON = `${OSS_BASE}/all-icon.png`

/** 头像卡片大会员配图 */
export const VIP_BADGE_IMG = `${OSS_BASE}/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png`

/** 弹幕开关图标（视频页，弹幕设置图标走 Less 变量 @oss-base） */
export const DANMU_OPEN_ICON = `${OSS_BASE}/danmuopen.svg`
export const DANMU_CLOSE_ICON = `${OSS_BASE}/danmuclose.svg`
