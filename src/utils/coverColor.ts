/**
 * 通过阿里云 OSS 图片处理获取封面主色（average-hue）。
 * 文档：https://help.aliyun.com/zh/oss/user-guide/query-the-average-tone
 * 返回格式可能是纯文本 "0xRRGGBB" 或 JSON {"RGB":"0xRRGGBB"}，
 * 本工具统一转换为 #RRGGBB 供前端使用。
 */

const AVERAGE_HUE_PARAM = 'x-oss-process=image/average-hue'

/**
 * 根据封面 URL 获取主色十六进制（如 #1b1517）。
 * @param coverUrl 封面地址（公开可读的 OSS 地址）
 * @returns #RRGGBB 字符串；失败/不可用时返回 null
 */
export async function fetchCoverColor(coverUrl: string): Promise<string | null> {
  if (!coverUrl) return null
  // 兼容 coverUrl 本身已带查询参数（如签名）的情况
  const sep = coverUrl.includes('?') ? '&' : '?'
  try {
    const resp = await fetch(`${coverUrl}${sep}${AVERAGE_HUE_PARAM}`, { mode: 'cors' })
    if (!resp.ok) return null
    const text = (await resp.text()).trim()
    let hex: string | null = null
    // 新版返回 JSON: {"RGB":"0xe7ac81"}
    try {
      const json = JSON.parse(text)
      if (json && typeof json.RGB === 'string') {
        hex = json.RGB.replace(/^0x/i, '')
      }
    } catch {
      // 旧版返回纯文本: 0xe7ac81
      hex = text.replace(/^0x/i, '')
    }
    if (hex && /^[0-9a-fA-F]{6}$/.test(hex)) {
      return `#${hex.toLowerCase()}`
    }
    return null
  } catch {
    return null
  }
}

type CoverColorTarget = { video: { coverUrl?: string; coverColor?: string | null } }

/**
 * 批量预取封面主色并写入 Video.coverColor（取色失败兜底白色）。
 * @param list 视频信息列表
 */
export async function preloadCoverColors(list: CoverColorTarget[]): Promise<void> {
  await Promise.all(
    list.map((item) => {
      // 已计算过则跳过，避免「加载更多」时重复请求
      if (item.video.coverColor) return Promise.resolve()
      return fetchCoverColor(item.video.coverUrl ?? '')
        .then((color) => {
          if (color) item.video.coverColor = color
          // 取色失败/不支持时保持 undefined，由 UI 兜底黑色
        })
        .catch(() => {})
    }),
  )
}
