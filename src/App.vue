<template>
  <div id="app">
    <!-- 一级路由
        1. 登陆页

        keep-alive 用来对需要缓存的页面进行缓存。
        如果在路由上有isKeepAlive 就会被缓存，
        否则就没有缓存。
     -->
     <keep-alive>
      <router-view v-if="$route.meta.isKeepAlive"/>
     </keep-alive>
     <router-view v-if="!$route.meta.isKeepAlive"/>
  </div>
</template>

<script>
export default {
  name: 'APP',
  created () {
    console.log('1')
  }
}
</script>
