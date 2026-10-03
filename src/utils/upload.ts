import { post } from '@/utils/request'
import { IMAGE_API } from '@/api/image'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * 上传图片（头像/主页背景），成功返回图片 URL，失败返回 null 并提示原因
 */
export async function uploadImage(
  file: File,
  scene: 'avatar' | 'background' = 'avatar',
): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    ElMessage.error('仅支持 jpg / png / webp 格式图片')
    return null
  }
  if (file.size > MAX_IMAGE_SIZE) {
    ElMessage.error('图片大小不能超过 5MB')
    return null
  }
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await post<{ code: number; message: string; data: string }>(
      `${IMAGE_API.UPLOAD}?scene=${scene}`,
      fd,
    )
    if (res.code === 200 && res.data) {
      return res.data
    }
    ElMessage.error(res.message || '上传失败')
    return null
  } catch (e) {
    console.log('图片上传失败:', e)
    ElMessage.error('上传失败，请稍后重试')
    return null
  }
}
