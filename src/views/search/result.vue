<template>
  <div class="serach-result">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="$route.query.keyword+'的搜索结果'"
      left-arrow
      fixed
      @click-left="$router.back()"
    />
    <!-- /导航栏 -->

    <!-- 文章列表
        1. van-list自带上拉加载更加多的效果
        2. 原理
          1） 数据项在list中。
          2） 在显示数据时，如果当前的数据内容不够一屏，它会自动调用onLoad去加载数据。
              在onLoad中，通过ajax取回数据
                - 添加到list
                - 把loading手动的设置为false
                - 如果所有的数据全部加载完成，则把 finished 设为true
          3) 如果手动向上拉，则也会去调用onLoad
    -->
    <van-list
      class="article-list"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="(item, idx) in list"
        :key="idx"
        :title="item.title"
        @click="$router.push('/article/' + item.art_id.toString())"
      />
    </van-list>
    <!-- /文章列表 -->
  </div>
</template>

<script>
import { getSearch } from '@/api/search.js'
export default {
  name: 'SearchResult',
  data () {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1 // 当前查询的页码
    }
  },

  methods: {
    async onLoad () {
      const keyword = this.$route.query.keyword
      const result = await getSearch(keyword, this.page)
      console.log(result)
      // 把结果添加到list中
      this.list.push(...result.data.data.results)

      // 加载状态结束
      this.loading = false

      // 下次再查，就是后一页
      this.page++

      // 数据全部加载完成
      if (result.data.data.results.length === 0) {
        this.finished = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.serach-result {
  height: 100%;
  overflow: auto;
  .article-list {
    margin-top: 39px;
  }
}
</style>
