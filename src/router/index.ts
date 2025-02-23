import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/views/HomeIndex.vue'),
    },
    {
      path: '/platform',
      name: 'platform',
      component: () => import('@/views/platform/PlatformIndex.vue'),
      redirect: '/platform/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/platform/home/PlatformHome.vue'),
        },
        {
          path: 'upload',
          name: 'upload',
          component: () => import('@/views/platform/upload/UploadIndex.vue'),
          children: [
            {
              path: 'video',
              name: 'video',
              component: () => import('@/views/platform/upload/video/VideoUpload.vue'),
            },
            {
              path: 'article',
              name: 'article',
              component: () => import('@/views/platform/upload/article/ArticleUpload.vue'),
            },
            {
              path: 'audio',
              name: 'audio',
              component: () => import('@/views/platform/upload/audio/AudioUpload.vue'),
            },
          ],
        },
      ],
    },
  ],
})

export default router
