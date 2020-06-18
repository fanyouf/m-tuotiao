<template>
  <div class="article-comments">
    <!-- 评论列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="(item,idx) in list"
        :key="idx"
      >
        <van-image
          slot="icon"
          round
          width="30"
          height="30"
          style="margin-right: 10px;"
          :src="item.aut_photo"
        />
        <span style="color: #466b9d;" slot="title">{{item.aut_name}}</span>
        <div slot="label">
          <p style="color: #363636;">{{item.content}}</p>
          <p>
            <span style="margin-right: 10px;">{{item.pubdate | relativeTime}}</span>
            <van-button size="mini" type="default" @click="hShowReply(item)">回复{{item.reply_count}}</van-button>
          </p>
        </div>
        <van-icon
        slot="right-icon"
        :name="item.is_liking ? 'like' : 'like-o'"
        @click="hSwitchLike(item)"
        />
      </van-cell>
    </van-list>
    <!-- 评论列表 -->

    <!-- 发布评论 -->
    <van-cell-group class="publish-wrap">
      <van-field
        clearable
        placeholder="请输入评论内容"
        v-model.trim="content"
      >
        <van-button slot="button" size="mini" type="info" @click="hAddComment">发布</van-button>
      </van-field>
    </van-cell-group>
    <!-- /发布评论 -->

    <!-- 评论回复
       vant弹层组件包含回复组件
       @close="isReplyShow=false" : 当子组件抛出名为close事件时，把弹层关闭掉
    -->
    <van-popup
      v-model="isReplyShow"
      round
      position="bottom"
      :style="{ height: '85%' }">
        <comment-reply
        v-if="isReplyShow"
        @close="isReplyShow=false"
        :comment="currentComment"
        :articleId="articleId"></comment-reply>
    </van-popup>
    <!-- 评论回复 -->
  </div>
</template>

<script>
import CommentReply from './commentReply.vue'
import { addComment, getComments, addCommentLike, deleteCommentLike } from '@/api/comment.js'
export default {
  name: 'ArticleComment',
  props: {
    articleId: {
      type: String,
      required: true
    }
  },
  components: {
    CommentReply
  },
  data () {
    return {
      currentComment: {}, // 当前要回复的评论
      isReplyShow: false,
      offset: null, // 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
      content: '', // 评论的内容
      list: [], // 评论列表
      loading: false, // 上拉加载更多的 loading
      finished: false // 是否加载结束
    }
  },
  created () {
    console.log('子组件comment.vue', this.$route.params.id)
  },
  methods: {
    hShowReply (item) {
      // 1. 展示回复组件
      this.isReplyShow = true

      // 2. 更新当前正在回复的组件
      this.currentComment = item
    },
    async hSwitchLike (comment) {
      const commentId = comment.com_id.toString()
      // 根据不同的状态来调用不同的方法
      // 已经点赞过了
      if (comment.is_liking) {
        await deleteCommentLike(commentId)
      } else {
        await addCommentLike(commentId)
      }
      this.$toast.success('操作成功')
      // 更新视图
      comment.is_liking = !comment.is_liking
    },
    async hAddComment () {
      // 1 验证
      if (this.content === '') {
        return
      }

      // 2. 发请求
      const result = await addComment({
        target: this.articleId,
        content: this.content
      })
      console.log(result)
      // bug: fixed 。补充一个is_liking属性
      result.data.data.new_obj.is_liking = false
      // 3. 更新视图： 在页面上应该要多出这一条评论
      //    从接口的返回值中，取出当前添加成功那条评论，追加到 list 的头部
      this.list.unshift(result.data.data.new_obj)
      // 4. 清空文本框
      this.content = ''
    },
    async onLoad () {
      // 1. 请求数据
      const result = await getComments({
        type: 'a', // 文章的评论
        source: this.articleId, // 文章id
        offset: this.offset
      })

      // 2. 把数据添加到list中
      this.list.push(...result.data.data.results)

      // 3. 加载状态结束
      this.loading = false

      // 4. 检查是否加载完成
      if (result.data.data.results.length === 0) {
        this.finished = true
      }

      // 5. 更新offset
      this.offset = result.data.data.last_id
    }
  }
}
</script>

<style scoped lang='less'>
// 发表评论的区域是固定在下端的
.publish-wrap {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
}
// 给发表评论区空出地方
.van-list {
  margin-bottom: 45px;
}
</style>
