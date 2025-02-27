import { defineStore } from 'pinia'
import { post } from '@/utils/request.ts'
import type { BaseResponse } from '@/types/api.ts'

export const useUploadStore = defineStore('upload', {
  state: () => {
    return {
      isShow: true, //true为展示投稿界面，false为展示稿件详情页
      file: null as File | null, // 上传的文件
      progress: 0, // 上传进度条
      uploadId: '',
      loading: false,
      coverFile: null as File | null,
      coverUrlBase64: '',
      VideoInfo: {
        auth: 0,
        coverUrl: '',
        delDate: '',
        descr: '',
        duration: 0,
        mcId: '',
        pubDate: '',
        scId: '',
        status: 1,
        tags: [] as string[],
        title: '',
        type: 1,
        uid: 0,
        vid: 0,
        videoUrl: '',
      },
    }
  },
  getters: {},
  actions: {
    changeIsShow() {
      this.isShow = !this.isShow
    },
    confirmUpload() {
      this.loading = true
      if (this.progress == 100) {
        const formData = new FormData()
        if (this.coverFile) {
          formData.append('coverFile', this.coverFile)
        }
        const newTags = this.VideoInfo.tags.length > 0 ? this.VideoInfo.tags.join('\n') : ''
        const newVideoInfo = {
          ...this.VideoInfo, // 浅拷贝对象
          tags: newTags, // 替换 tags
        }
        formData.append('videoInfo', JSON.stringify(newVideoInfo))
        post<BaseResponse>('/upload/complete', formData, {
          params: {
            uploadId: this.uploadId,
            fileName: this.file?.name,
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then((res) => {
          if (res.code == 200) {
            this.loading = false
            this.VideoInfo.tags = []
            ElMessage.success(res.message)
          } else if (res.code == 500) {
            ElMessage.error(res.message)
          }
        })
      }
    },
  },
})
