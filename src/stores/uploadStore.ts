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
    }
  },
  getters: {},
  actions: {
    changeIsShow() {
      this.isShow = !this.isShow
    },
    confirmUpload() {
      if (this.progress == 100) {
        console.log(222)
        post<BaseResponse>('/upload/complete', null, {
          params: { uploadId: this.uploadId, fileName: this.file?.name },
        }).then((res) => {
          if (res.code == 200) {
            ElMessage.success(res.message)
          } else if (res.code == 500) {
            ElMessage.error(res.message)
          }
        })
      }
    },
  },
})
