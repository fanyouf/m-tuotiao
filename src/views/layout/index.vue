<template>
  <div class='container'>
    <!-- 顶部是搜索导航区
       v-show="$route.path!='/user'": 这个部分在 “我的” 页面中不要出现
    -->
    <van-nav-bar
      v-show="$route.path!='/user'"
      title="黑马头条"
      right-text="搜索"
      fixed
      @click-right="$router.push('/search')"
    />

    <!-- 路由出口：二级路由 -->
    <router-view></router-view>

    <!-- nav-tabbar:导航工具条
      route: 开启路由模式
      to: 要跳转的路由地址
    -->
    <van-tabbar route>
      <van-tabbar-item icon="home-o"  to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="chat-o"  to="/question">问答</van-tabbar-item>
      <van-tabbar-item icon="video-o" to="/video">视频</van-tabbar-item>
      <van-tabbar-item icon="user-o"  to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>

export default {
  name: 'Layout',
  created () {
    console.log('layout 创建')
  },
  destroyed () {
    console.log('layout destroyed')
  }
}
</script>

<style scoped lang='less'></style>
