<template>
<!---
  为了恢复这个页面时，能还原它的滚动条的位置，思路：
    1. 监听用户的滚动，保存下来当前的位置。
      @scroll
    2. 再次回来时，页面恢复时， 重置一下滚动条。
-->
  <div class="scroll-wrapper" @scroll="hScroll" ref="refScroll">
    <van-pull-refresh v-model="isLoadingNew" @refresh="onRefresh">
      <!-- {{channel.name}}文章列表组件 -->
      <!--
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
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
        v-for="(item,idx) in list"
        :key="idx"
        :title="item.title"
        @click="$router.push('/article/' + item.art_id.toString())"
        >
          <!-- van-cell有一个名为label的插槽，用来设置标题正下方的内容 -->
          <div slot="label">
            <!-- 图文.... -->
            <!-- 图片 van-grid
              当前文章有几张图，就用几个宫格
              :border="false" 取消宫格的边框线。
               - border="false" 表示它的属性值就是一个普通的字符串"falase
            -->
            <van-grid :column-num="item.cover.images.length" :border="false">
              <van-grid-item v-for="(img,idx) in item.cover.images" :key="idx">
                <van-image lazy-load :src="img" />
              </van-grid-item>
            </van-grid>

            <!-- 文字说明 -->
            <div class="meta">
              <span>{{item.aut_name}}</span>
              <span>{{item.comm_count}}评论</span>
              <span>{{item.pubdate | relativeTime}}</span>
              <!-- 只有是登陆用户，才能看见这个 X 按钮 -->
              <span class="close" @click.stop="hClose(item)" v-if="$store.state.tokenInfo.token">
                <van-icon name="cross"></van-icon>
              </span>
            </div>
          </div>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from '@/api/article.js'
export default {
  name: 'ArticleList',
  props: ['channel'],
  components: { },
  data () {
    return {
      // 页面打开时，List是一个空数组，其中没有数据。
      // 由于不足一屏，van-list会自动发起onLoad，onLoad会请求回来数据，然后添加到list中。
      // 由于list是响应式的，list中有了数据，则页面上的内容会自动撑开：
      //     如果不够一屏，则van-list会继续发起onLoad....
      //     如果够一屏，则等用户的操作。

      // 如果用户向上滑动，则van-list自动去发起onLoad，再次取回数据，追加到list中，由于list是响应式的
      // 则用户就可以看到新的数据了。
      //
      // 这个过程中，list会越来越长！

      list: [], // 保存取回的文章列表
      loading: false, // 是否上拉加载
      finished: false, // 上拉加载是否已经加载了全部的数据
      timestamp: null,
      isLoadingNew: false // 是否下拉刷新加载更多
    }
  },
  // 定义局部过滤器.只能在当前组件中使用。
  // 对于时间格式化这种普遍，最好是写成 全局 过滤器，方便在本项目中所有的组件都来使用
  // filters: {
  //   myfilter: function (val) {
  //     return '123*' + val
  //   },
  //   relativeTime: relativeTime
  // },
  created () {
    // 创建组件完成，会自动调用created
    // 监听事件总线上是否有delArticle事件发布
    // 当事件发生时，在回调函数中，接收参数
    this.$eventBus.$on('delArticle', obj => {
      // console.log(Date.now(), this.channel, '收到事件 delArticle')
      // console.log(obj)
      // 从参数中折分出channelId和articleid
      const { channelId, articleId } = obj
      // 判断是否需要从本组件中的list中 删除掉 编号为article的文章？
      // this.channel是通过父组件中的props传入的
      if (channelId !== this.channel.id) {
        console.log('与我不无关', this.channel.id)
        return
      }

      // 在list中找出文章id为articleId的元素，并删除
      console.log('在list中找出文章id为articleId的元素，并删除', articleId)
      // 在数组list中找出一个元素(它的id为articleId)，删除它
      //   (1) 找出元素的下标
      //   (2) 删除：slice(下标,1)
      const idx = this.list.findIndex(it => it.art_id.toString() === articleId)
      if (idx !== -1) {
        // 找到了下标, 删除它
        this.list.splice(idx, 1)
      }
    })
  },
  activated () {
    // console.log('activated')
    // 去设置一下滚动条的位置
    if (this.scrollTop && this.$refs.refScroll) {
      this.$refs.refScroll.scrollTop = this.scrollTop
    }
  },
  // deactivated () {
  //   console.log('deactivated')
  // },
  methods: {
    // 监听滚动条事件
    hScroll (event) {
      // 记录下当前滚动条的位置。
      // 这里并不需要放在一个数据项中。由于这里的scrollTop并不需要在页面上显示出来，
      // 所以用一个普通的属性就行
      this.scrollTop = event.target.scrollTop
      // console.log(event, event.target.scrollTop)
    },
    // 用户点击了某个文章的关闭按钮
    hClose (article) {
      // 向父级件index.vue抛出一个事件。 当父组件收到时这个事件时，去把弹层打开。
      // 传递当前的文章 编号
      // 由于这里的文章编号可能是经过大数处理之后的对象，所以这里要加toString
      this.$emit('showMoreAction', article.art_id.toString())
    },
    async onRefresh () {
      // 发请求取回最新的数据
      const result = await getArticles(this.channel.id, Date.now())
      const arr = result.data.data.results
      // 把数据添加到list中
      // 添加到list的开头!
      this.list.unshift(...arr)

      // 更新下拉刷新的状态
      this.isLoadingNew = false

      // 提示
      this.$toast.success('加载成功' + arr.length + '条')
    },
    // onLoad的执行时机：
    // 1. 页面打开，不足一屏，会自动调用
    // 2. 手动上拉
    async onLoad () {
      if (!this.timestamp) {
        this.timestamp = Date.now()
      }
      try {
        const result = await getArticles(this.channel.id, this.timestamp)
        console.log(result)
        // arr是一个数组[{},{},{}]
        const arr = result.data.data.results

        // 保存本次请求的回来的数据中的时间戳，以便下次传入
        this.timestamp = result.data.data.pre_timestamp
        console.log(arr)
        // 1. 把请求结果 添加到 list中
        // this.list = this.list.concat(arr)
        this.list.push(...arr)
        // 2. 加载状态结束
        this.loading = false
        // 3. 判断是否数据全部加载完成
        // 如果本次取不到数据了，则说明所有的数据加载完成
        if (arr.length === 0) {
          this.finished = true
        }
      } catch {
        this.loading = false
        this.finished = true
        this.list = []
        this.$toast('获取失败')
      }
    }
  }
}
</script>

<style scoped lang='less'>
.meta {
  display:flex;
  span {
    margin-right:10px;
  }
  .close{
    // 让它在最右边
    // 它的父级容器是flex的，给当前元素设置左外边距为auto，会让这个元素在父级容器
    // 的最右边
    margin-left:auto;
  }
}
</style>
