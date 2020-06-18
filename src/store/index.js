import Vue from 'vue'
import Vuex from 'vuex'

import { getItem, setItem } from '@/utils/storage.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 保存公共数据
    // 在tokenInfo中保存token和refresh_token

    // 在设置vuex中的初值时，先从本地存储中取，如果取不到，则初始为空
    tokenInfo: getItem('tokenInfo') || {},
    photo: getItem('photo') || '' // 用户头像,一个url地址
  },
  mutations: {
    mSetPhoto (state, newPhotoUrl) {
      state.photo = newPhotoUrl
      setItem('photo', newPhotoUrl)
    },
    mClearTokenInfo (state) {
      // 相当于就是清空
      state.tokenInfo = {}
      // 持久化
      setItem('tokenInfo', state.tokenInfo)
    },
    // 补充mutation来设置tokenInfo
    mSetTokenInfo (state, tokenObj) {
      state.tokenInfo = tokenObj
      console.log(tokenObj)
      console.log(JSON.stringify(tokenObj))
      setItem('tokenInfo', tokenObj)
    },
    // 只更新token，不更新refresh_token
    mUpdateToken (state, newToken) {
      console.log('mUpdateToken')
      // 收到更新token的通知
      state.tokenInfo.token = newToken

      setItem('tokenInfo', state.tokenInfo)
    }
  }
})
