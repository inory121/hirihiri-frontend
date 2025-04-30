// 补零工具函数
const pad = (n: number): string => n.toString().padStart(2, '0')

// 时间差计算工具（单位：毫秒）
const getTimeDiff = (target: Date, now: Date = new Date()) => {
  const diffMs = now.getTime() - target.getTime()
  return {
    minutes: Math.floor(diffMs / 60000),
    hours: Math.floor(diffMs / 3600000),
    days: Math.floor(diffMs / 86400000),
    isYesterday: () => {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      return (
        target.getDate() === yesterday.getDate() &&
        target.getMonth() === yesterday.getMonth() &&
        target.getFullYear() === yesterday.getFullYear()
      )
    },
  }
}

// 格式化视频时长（秒 → HH:MM:SS 或 MM:SS）
export const formatDuration = (seconds: number): string => {
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`
}

// 格式化首页视频时间（如：刚刚/分钟/小时/昨天/月-日/年-月-日）
export const formatTime = (isoString: string): string => {
  const target = new Date(isoString)
  const { minutes, hours, isYesterday } = getTimeDiff(target)

  if (minutes < 1) return '刚刚'
  if (hours < 1) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (isYesterday()) return '昨天'

  return target.getFullYear() === new Date().getFullYear()
    ? `${target.getMonth() + 1}-${target.getDate()}`
    : `${target.getFullYear()}-${target.getMonth() + 1}-${target.getDate()}`
}

// 格式化视频播放页时间（支持自定义格式，如 YYYY-MM-DD HH:mm）
export const formatDateTime = (
  isoString: string | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string => {
  if (!isoString) return ''
  const date = new Date(isoString)

  const formatMap: { [key: string]: string } = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formatMap[match] || match)
}

// 格式化评论时间（如：刚刚/分钟/小时/昨天/月-日/年-月-日）
export const formatCommentTime = (isoString: string): string => {
  const target = new Date(isoString)
  const { minutes, hours, isYesterday } = getTimeDiff(target)

  if (minutes < 1) return '刚刚'
  if (hours < 1) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (isYesterday()) return '昨天'

  return formatDateTime(isoString, 'YYYY-MM-DD HH:mm:ss')
}
