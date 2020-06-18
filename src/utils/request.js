// 在一个普通的模块中去获取vuex中的值
// 直接import
import store from '@/store/index.js'

// 引入路由
import router from '@/router/index.js'

import JSONBig from 'json-bigint' // 引入大数字包

// 对axios进行二次封装
//   1. 指定基地址
//   2. 通过请求拦截器来添加token
//   3. 通过响应拦截器来大数处理
import axios from 'axios'
console.log(router)
console.log(store)
// 有可能在一个项目中存在多个指口向不同的基地址的情况，
// 定义多个axios的实例，以备不时之需
const instance1 = axios.create({
  // baseURL: 'http://api-toutiao-web.itheima.net',
  baseURL: 'http://ttapi.research.itcast.cn',
  transformResponse: [function (data) {
    // Do whatever you want to transform the data
    // console.log('transformResponse', data)
    // data:就是本次请求获取的数据
    // 在这里可以对它进行进一步的处理 -- JSONBig
    // 后端返回数据可能不是 JSON 字符串，而JSONBig.parse()只能处理JSON字符串
    // 所以，为了保证代码可以正常执行，这里引入try-catch来捕获异常
    try {
      // 如果没有遇到错误，就返回 JSONBig处理之后的数据
      return JSONBig.parse(data)
    } catch (err) {
      console.log('JSONBig转换出错', err)
      return data
    }
  }]
})

// 在instance1上添加请求拦截器，补充请求头：token信息
instance1.interceptors.request.use(function (config) {
  // Do something before request is sent
  // 这里的config就是当前请求的配置
  console.log(config)
  const token = store.state.tokenInfo.token
  if (token) {
    // 从vuex中取出token，添加在headers中
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// 添加响应拦截器-- 处理401 token过期问题
// 拦截器有两个参数：
//  参数1：表示正常响应时的处理函数
//  参数2：表示有错误时的处理函数。由于我们要统一处理401错误，所以在第二个参数中写代码。
instance1.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response
}, async function (error) {
  // 对响应错误做点什么
  console.dir(error)
  // 获取本次错误的代码，如果是401就做操作
  if (error.response.status === 401) {
    console.log('error401')
    const refreshToken = store.state.tokenInfo.refresh_token
    // 检查是否有refresh_token
    if (refreshToken) {
      try {
        // 用refresh_token重发请求，再次取回一个有效期为2小时的token
        const result = await axios({
          method: 'PUT',
          url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
          headers: {
            Authorization: `Bearer ${refreshToken}`
          }
        })
        console.log('用refresh_token重发请求，再次取回一个有效期为2小时的token')
        console.log(result)
        const newToken = result.data.data.token
        // 更新vuex
        // 现在不在某个组件中，格式不是this.$store.commit。就直接就是store.commit('mutation名',值)
        store.commit('mUpdateToken', newToken)
        // 重发请求
        //   - instance1是我们在上面创建的axios的实例
        //   - error.config 是前面得到401错误的那个请求配置
        return instance1(error.config)
      } catch {
        console.log('使用refresh_token获取新token失败')
        // 使用refresh_token获取新token失败
        // 回到登录页
        router.push({
          path: '/login',
          query: {
            // router.currentRoute.fullPath :router中一个属性currentRoute表示当前路由对象
            backto: router.currentRoute.fullPath
          }
        })
      }
    } else {
      console.log('router')
      console.log(router)
      // router是我们封装的路由对象。
      // 这里不是在某个vue组件中来使用的，不需要写this.$router.push()
      // 直接跳到登陆页
      router.push({
        path: '/login',
        query: {
          // router.currentRoute.fullPath :router中一个属性currentRoute表示当前路由对象
          backto: router.currentRoute.fullPath
        }
      })
    }
  } else {
    // 直接返回一个rejected状态的promise
    return Promise.reject(error)
  }
})

const instance2 = axios.create({
  baseURL: 'https://some-xxxxx.com/api/',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' }
})

// 此时用instance1,instance2实例就可以提向两个不同的基地址。

// 这里采用同时使用默认导出和按需导出

// 在另一个模块中使用时：import { instance1, instance2 }  from './request.js'
export { instance1, instance2 }

// 在另一个模块中使用时：import ajax from './request.js'
export default instance1
