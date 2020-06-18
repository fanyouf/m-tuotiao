import Vue from 'vue'
import store from '@/store/index'
import VueRouter from 'vue-router'
import Login from '@/views/login' // /index.vue是可以省略的
import LayoutIndex from '@/views/layout' // /index.vue是可以省略的
import HomeIndex from '@/views/home'
import VideoIndex from '@/views/video'
Vue.use(VueRouter)

const routes = [
  // 用户登陆
  { path: '/login', component: Login },
  // 主页
  {
    path: '/',
    component: LayoutIndex,
    // 嵌套路由
    // 当访问http://localhost:8080/#/user 时
    //   把UserIndex组件放在 LayoutIndex组中的router-view中去
    children: [
      { path: '', component: HomeIndex, meta: { isKeepAlive: true } },
      { path: '/user', component: () => import('@/views/user/index') },
      { path: '/video', component: VideoIndex }
    ]
  },
  // 路由懒加载
  { path: '/search', component: () => import('@/views/search/index') },
  // 这个路由是打算以查询字符串的方式来传入查询关键字
  { path: '/search/result', component: () => import('@/views/search/result') },
  // 这个路由是打算以动态路由的方式来传入文章编号
  { path: '/article/:id', component: () => import('@/views/article/index') },
  { path: '/user/profile', component: () => import('@/views/user/profile') },
  { path: '/user/chat', component: () => import('@/views/user/chat') }
]

const router = new VueRouter({
  routes
})

// 路由守卫
// 在路由变化时，在跳入到目标路由页 之前 会执行这个函数。
//  localhost:8080/#/a ------> localhost:8080/#/b
router.beforeEach(function (to, from, next) {
  console.log('路由变化', to, from, next)
  // to: 到哪里去
  // from: 从哪里来
  // next: 是一个函数，用来自行定义路由的跳转
  //   (1) next() 直接放行，让路由进入到to页面
  //   (2) next(其它路由) 不去to了，而是进入指定的路由

  // 如果要去页面是以/user开头的，则进行身份验证
  if (to.path.startsWith('/user')) {
    console.log('store', store)
    // 验证身份--- 是否携带token
    // 通过，则使用next()放行
    if (store.state.tokenInfo.token) {
      next()
    } else {
      next({
        path: '/login',
        query: {
          backto: to.fullPath
          // fullPath：包含查询字符串: /user?a=1&b=2
          // path: /user
        }
      })
      // 不通过，则跳回登陆
    }
  } else {
    next()
  }
})
export default router
