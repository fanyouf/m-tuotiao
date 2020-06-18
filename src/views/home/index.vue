<template>
  <div class="index">
    <!-- v-model 双向绑定：哪一个下标的频道处于活动状态  -->
    <van-tabs v-model="activeIndex">
      <van-tab v-for="(item,idx) in channels" :key="idx" :title="item.name">
        <!--
          在父组件index.vue中把频道信息传给articleList.vue组件
          article-list放在for循环中，但它并不会立刻创建channels.length个组件出来，
          而是具备懒加载的效果： 当你激活当前的tab签，会去创建一个对应的articleList组件。

          监听子组件article-list中传出来的 showMoreAction事件
        -->
        <article-list
        :channel="item"
        @showMoreAction="hShowMoreAction"></article-list>
      </van-tab>
    </van-tabs>

    <!-- 频道列表 开关 通过定位 让它固定到右上角处 -->
    <div class="bar-btn" @click="hShowChannelEdit">
        <van-icon name="wap-nav" size="24" />
    </div>

    <!-- 文章 --- 更多操作
      监听不感兴趣
      监听举报
      给子组件加一个ref之后，就可以在当前组件中通过this.$refs.refMoreAction
      来找到这个子组件
    -->
    <van-popup v-model="showMoreAction" :style="{ width: '80%' }">
      <more-action
      ref="refMoreAction"
      @dislike="hDislike"
      @report="hReport"></more-action>
    </van-popup>

    <!-- 频道管理
      1. 父传子。
          把当前订阅频道传给 频道编辑组件
          把当前激活的频道下标传给 频道编辑组件
      2. 子传父
          监听close， updateCurChannel, updateCurIndex
    -->
    <van-action-sheet v-model="showChannelEdit" title="频道管理">
      <channel-edit
      ref="refChannelEdit"
      :channels="channels"
      :activeIndex="activeIndex"
      @close="hCloseChannelEdit()"
      @updateCurIndex="hUpdateCurIndex"
      @updateCurChannel="hUpdateCurChannel"></channel-edit>
    </van-action-sheet>
  </div>
</template>

<script>
import { dislikeArticle, reportArticle } from '@/api/article.js'
import { getChannels } from '@/api/channel.js'
import ArticleList from './articleList'
import ChannelEdit from './channelEdit'
import MoreAction from './moreAction'
export default {
  name: 'Home',
  props: { },
  components: {
    ArticleList,
    MoreAction,
    ChannelEdit
  },
  data () {
    return {
      activeIndex: 0, // 表示当前tabs中处于活动状态是哪一个下标
      articleId: null, // 当前要执行更加操作时 的文章编号
      showMoreAction: false, // 是否显示更多操作弹层
      showChannelEdit: false, // 是否频道编辑操作弹层
      channels: [] // 频道列表,当前用户已经订阅的频道
    }
  },
  computed: { },
  created () {
    this.loadChannels()
  },
  methods: {
    hShowChannelEdit () {
      this.showChannelEdit = true
      // this.$refs就可以自动收集所有设置了ref属性的子组件
      if (this.$refs.refChannelEdit) {
        this.$refs.refChannelEdit.editing = false
      }
    },
    hCloseChannelEdit () {
      this.showChannelEdit = false
    },
    // 处理子组件中抛出的更新当前频道下标的事件
    hUpdateCurIndex (index) {
      this.activeIndex = index
    },
    // 处理子组件中抛出的更新当前频道项的事件
    hUpdateCurChannel (channel) {
      console.log('处理子组件中抛出的更新当前频道项的事件', channel)
      // 1. 计算出这个频道在频道列表中的下标
      const idx = this.channels.findIndex(it => it.id === channel.id)

      // 2. 更新给activeIndex
      this.activeIndex = idx
    },
    delArticle () {
      //  (1) 只是本地删除不是直接去删除后端数据（人不喜欢，别人有喜欢的）
      //       找到对应的articleList组件，把其中的list数据中找出那个文章，删除
      //  (2) 在通知子组件articleList做删除时，由于一个父组件index.vue中有很多个
      //      子组件articleList，所以这里要引入事件总线来解决消息的发布

      // 事件总线发布消息
      // 参数是一个对象，表示当前要删除的文章编号，及当前的频道编号
      const eventObj = {
        articleId: this.articleId,
        channelId: this.channels[this.activeIndex].id
      }
      console.log(eventObj)
      this.$eventBus.$emit('delArticle', eventObj)
    },
    async hDislike () {
      // alert('收到子组件moreAction中的dislike，要操作的id是' + this.articleId)
      // 1. 调用接口
      const result = await dislikeArticle(this.articleId)
      console.log(result)
      this.$toast.success('操作成功')
      // 2. 关闭弹层
      this.showMoreAction = false

      // 3. 删除文章
      this.delArticle()
    },
    // 处理用户举报文章
    async hReport (reportTypeId) {
      // 1. 调用接口
      const result = await reportArticle(this.articleId, reportTypeId)
      console.log(result)
      this.$toast.success('操作成功')
      // 2. 关闭弹层
      this.showMoreAction = false

      // 3. 删除文章
      this.delArticle()
    },
    // 从子组件artilceList中收到 点击X 的事件
    hShowMoreAction (articeleId) {
      // alert('收到hShowMoreAction事件' + articeleId)

      // 1. 保存要操作的文章编号
      this.articleId = articeleId

      // 2. 显示弹层
      this.showMoreAction = true

      // 3. 确保 moreAction组件中的isRport设置为false
      // 由于这个子组件MoreAction是在popup中放置的，所以只在当弹层出来时
      // 它才会创建出来，所以第一次点击x时，我们在这里并不能访问到这个refMoreAction
      // if (this.$refs.refMoreAction) {
      //   // 每次点击x时，打开moreAction弹层，都要 为false.
      //   // 本质上: 在父组件中去修改子组件的数据
      //   // 格式： this.$refs.子组件引用.子数组的数据 = 新值
      //   console.log(this.$refs) // 这是一个对象，它保存着当前组件所有对子组件的引用
      //   console.log(this.$refs.refMoreAction)
      //   this.$refs.refMoreAction.isReport = false
      // }
      this.$refs.refMoreAction && (this.$refs.refMoreAction.isReport = false)
    },
    async loadChannels () {
      const result = await getChannels()
      console.log(result)
      this.channels = result.data.data.channels
    }
  }
}
</script>

<style scoped lang='less'></style>
