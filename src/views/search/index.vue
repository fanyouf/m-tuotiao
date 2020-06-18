<template>
  <div>
    <!-- 搜索组件一级路由
    - $router.方法()
       1. $router.push()
       2. $router.back() // 后退一步
    返回上一个页面-->
    <van-nav-bar
      left-arrow
      title="搜索中心"
      @click-left="$router.back()"></van-nav-bar>

    <!--
      思路： 只要内容发生变化就要去调用接口，获取系统提出的搜索建议
      解决方案： van-search中提供一个特殊的事件名input，当内容发生变化时，它就会立刻触发
    -->
    <van-search
      show-action
      placeholder="请输入搜索关键词"
      shape="round"
      v-model.trim="keyword"
      @input="hGetSuggestion_with_jie_liu"
      >
      <div slot="action" @click="hSearch">搜索</div>
    </van-search>
    <!-- 联想建议
      van-cell 中的title用来显示内容
      hSearchSuggestion 这里不直接传item,因为item是亮高的结果
    -->
    <van-cell-group v-if="keyword">
      <van-cell
      v-for="(item,idx) in cSuggestion"
      @click="hSearchSuggestion(idx)"
      :key="idx"
      icon="search">
        <div v-html="item"></div>
      </van-cell>
    </van-cell-group>
    <!-- /联想建议 -->

    <!--
      搜索历史记录
      1. 删除： history.splice(idx,1)

      2. 这里有两个点击事件。对于 关闭按钮来说，不希望它有冒泡到外层click的副作用
         可以：@click.stop
    -->
    <van-cell-group v-else>
      <van-cell title="历史记录">
      </van-cell>
      <van-cell
      v-for="(item,idx) in history"
      :key="idx"
      :title="item"
      @click="$router.push('/search/result?keyword=' + item)">
        <van-icon name="close" @click.stop="hDelHistory(idx)" />
      </van-cell>
    </van-cell-group>
    <!-- /搜索历史记录 -->
  </div>
</template>

<script>
import { setItem, getItem } from '@/utils/storage'
import { getSuggestion } from '@/api/search.js'
// 代码简洁之道： 消除 魔术数
// 以常量的格式定义一个名字，用来在localstorage中保存信息
const LOCALSTROAGE_SEARCH_NAME = 'searchHistory'
export default {
  name: 'Search',
  data () {
    return {
      timer: null, // 定时器记录
      // 初始从本地取出localStorage中取出数据
      history: getItem(LOCALSTROAGE_SEARCH_NAME) || [], // 保存搜索记录
      suggestion: [], // 当前的搜索建议
      keyword: '' // 搜索关键字
    }
  },
  computed: {
    cSuggestion () {
      // 根据keyword 对suggestion的每一项进行亮高处理
      // 目标就是亮高
      const reg = new RegExp(this.keyword, 'gi')

      // 计算属性： 得到一个高亮新数组
      // return this.suggestion.map(str => {
      //   // keyword :b
      //   // str: "abcd"  ---> a<span style="color:red">b</span>cd
      //   // const str1 = str.replace(reg, function (str) {
      //   //   return `<span style="color:red">${str}</span>`
      //   // })
      //   // return str1
      //   return str.replace(reg, str => `<span style="color:red">${str}</span>`)
      // })

      // 计算属性： 得到一个高亮新数组
      return this.suggestion.map(str => str.replace(reg, str => `<span style="color:red">${str}</span>`))
    }
  },
  methods: {
    // 搜索的第1种方式： 用户点击某个搜索建议
    hSearchSuggestion (idx) {
      // console.log('你当前点是第', idx)
      // 把当前搜索建议 添加到搜索记录中
      this.addHistory(this.suggestion[idx])

      // 跳转到结果页：路由跳转并传入参数
      this.$router.push('/search/result?keyword=' + this.suggestion[idx])
    },
    // 搜索的第2种方式： 用户点击搜索按钮
    hSearch () {
      if (this.keyword === '') {
        return
      }
      // 把当前搜索关键字 添加到搜索记录中
      this.addHistory(this.keyword)

      // 跳转到结果页：路由跳转并传入参数
      // 方式一：最朴素的拼接的方式
      // this.$router.push('/search/result?keyword=' + this.keyword)
      // 方式二：对象格式
      this.$router.push({
        path: '/search/result',
        query: {
          keyword: this.keyword
        }
      })
    },
    addHistory (str) {
      // 添加数据到搜索记录是很复杂的，所以当前列一个方法
      // 1. 历史记录是一个数组，但其中的元素是不能重复的
      //    在数组中找到重复的，删除掉
      const idx = this.history.findIndex(it => it === str)
      if (idx !== -1) {
        // 说明在历史记录中有这一项
        // 删除掉
        this.history.splice(idx, 1)
      }
      // 2. 最近搜索记录应该在数组最前面
      //     unshift 是在头部添加
      this.history.unshift(str)

      // 额外做一次本地存储
      setItem(LOCALSTROAGE_SEARCH_NAME, this.history)
    },
    hDelHistory (idx) {
      this.history.splice(idx, 1)

      // 额外做一次本地存储
      setItem(LOCALSTROAGE_SEARCH_NAME, this.history)
    },
    // 这个函数执行频道太高了，下面对它进行优化
    async hGetSuggestion () {
      if (this.keyword === '') {
        this.suggestion = []
        return
      }
      console.log(Date.now(), '关键字', this.keyword)
      // console.log(getSuggestion)
      const result = await getSuggestion(this.keyword)
      console.log(result)
      this.suggestion = result.data.data.options
    },
    // 防抖处理
    hGetSuggestion_with_fang_dou () {
      console.log(Date.now(), this.keyword)
      // 以防抖5s为例
      // 当这个函数被调用时，它不会立刻执行，而在5s之后执行。
      // 如果在5s内，它再次被调用了，则从当前被调用的时间开始，再向后延迟5s执行。
      if (this.timer) {
        clearTimeout(this.timer)
      }

      this.timer = setTimeout(async () => {
        if (this.keyword === '') {
          this.suggestion = []
          return
        }
        console.log(Date.now(), '关键字', this.keyword)
        // console.log(getSuggestion)
        const result = await getSuggestion(this.keyword)
        console.log(result)
        this.suggestion = result.data.data.options
      }, 0.3 * 1000)
    },
    // 节流处理
    // 生活中： 水龙节放水，慢慢关，关到水是一滴一滴向下滴出来。
    // 之前水流的快，现在这里流的慢 -------- 降频

    hGetSuggestion_with_jie_liu () {
      // 如果这个函数距离上一次被调用的时间之间相隔不到5s，则本次调用不执行代码
      // 两次执行的时间，至少相隔5s
      console.log(Date.now(), this.keyword)
      if (!this.timer) {
        this.timer = setTimeout(async () => {
          this.timer = null

          if (this.keyword === '') {
            this.suggestion = []
            return
          }
          console.log(Date.now(), '关键字', this.keyword)
          // console.log(getSuggestion)
          const result = await getSuggestion(this.keyword)
          console.log(result)
          this.suggestion = result.data.data.options
        }, 0.5 * 1000)
      }
    }
  }
}
</script>

<style lang="" scoped>

</style>
