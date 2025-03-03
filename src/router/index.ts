import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeIndex.vue'),
      meta: { requestAuth: false },
    },
    {
      path: '/platform',
      component: () => import('@/views/platform/PlatformIndex.vue'),
      redirect: '/platform/home',
      meta: { requestAuth: true },
      children: [
        {
          path: 'home',
          component: () => import('@/views/platform/home/PlatformHome.vue'),
        },
        {
          path: 'upload',
          component: () => import('@/views/platform/upload/UploadIndex.vue'),
          redirect: '/platform/upload/video',
          children: [
            {
              path: 'video',
              component: () => import('@/views/platform/upload/video/VideoUpload.vue'),
            },
            {
              path: 'article',
              component: () => import('@/views/platform/upload/article/ArticleUpload.vue'),
            },
            {
              path: 'audio',
              component: () => import('@/views/platform/upload/audio/AudioUpload.vue'),
            },
          ],
        },
        {
          path: 'upload-manager',
          component: () => import('@/views/platform/upload-manager/article/ArticleManager.vue'),
          redirect: '/platform/upload-manager/article',
          children: [
            {
              path: 'article',
              component: () => import('@/views/platform/upload-manager/article/ArticleManager.vue'),
            },
          ],
        },
        {
          path: 'upload-manager/appeal',
          component: () => import('@/views/platform/upload-manager/appeal/AppealManager.vue'),
        },
        {
          path: 'upload-manager/audience-zimu',
          component: () =>
            import('@/views/platform/upload-manager/audience-zimu/AudienceZimuManager.vue'),
        },
        {
          path: 'data-up/video',
          component: () => import('@/views/platform/data-up/DataUpVideo.vue'),
        },
        {
          path: 'fans/medal',
          component: () => import('@/views/platform/fans/FansMedal.vue'),
        },
        {
          path: 'comment',
          component: () => import('@/views/platform/comment/article/CommentArticle.vue'),
          redirect: '/platform/comment/article',
          children: [
            {
              path: 'article',
              component: () => import('@/views/platform/comment/article/CommentArticle.vue'),
            },
          ],
        },
        {
          path: 'inter-active',
          component: () => import('@/views/platform/inter-active/Danmu/InterActiveDanmu.vue'),
          redirect: '/platform/inter-active/article',
          children: [
            {
              path: 'danmu',
              component: () => import('@/views/platform/inter-active/Danmu/InterActiveDanmu.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/video/:vid',
      component: () => import('@/views/video/VideoIndex.vue'),
      meta: { requestAuth: false },
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: '页面不存在' } // 可选：添加元信息
    },
    {
      path:'/:pathMatch(.*)*',
      redirect: '/404'
    }
  ],
})
router.beforeEach((to, from, next) => {
  if (to.meta.requestAuth && !localStorage.getItem('hiri_token')) {
    next({ path: '/' })
  } else {
    next()
  }
})
export default router
