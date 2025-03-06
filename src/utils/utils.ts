// 格式化视频时长
export const formatDuration = (seconds: number) => {
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  // 根据小时数决定格式
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
// 格式化首页视频时间
export const formatTime = (isoString: string) => {
  const target = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - target.getTime()

  // 时间差计算
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  // 1分钟内显示"刚刚"
  if (diffMinutes < 1) {
    return '刚刚'
  }

  // 1小时内显示分钟
  if (diffHours < 1) {
    return `${diffMinutes}分钟前`
  }

  // 24小时内显示小时
  if (diffHours < 24) {
    return `${diffHours}小时前`
  }

  // 判断昨天（精确到自然日）
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (
    target.getDate() === yesterday.getDate() &&
    target.getMonth() === yesterday.getMonth() &&
    target.getFullYear() === yesterday.getFullYear()
  ) {
    return '昨天'
  }

  // 今年显示月-日
  if (target.getFullYear() === now.getFullYear()) {
    return `${target.getMonth() + 1}-${target.getDate()}`
  }

  // 跨年显示完整日期
  return `${target.getFullYear()}-${target.getMonth() + 1}-${target.getDate()}`
}
// 格式化视频播放页时间
export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString)

  // 补零函数
  const pad = (n: number) => n.toString().padStart(2, '0')

  // 分解时间部件
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // 月份补零
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
