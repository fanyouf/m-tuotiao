<template>
<div class="article-comments">
  <!-- 导航栏 -->
  <van-nav-bar :title="comment.reply_count + '条回复'">
    <!-- 通知父组件关闭弹层 -->
    <van-icon @click="$emit('close')" slot="left" name="cross" />
  </van-nav-bar>
  <!-- /导航栏 -->

  <!-- 当前评论 -->
  <van-cell title="当前评论">
    <van-image
      slot="icon"
      round
      width="30"
      height="30"
      style="margin-right: 10px;"
      :src="comment.aut_photo"
    />
    <span style="color: #466b9d;" slot="title">{{comment.aut_name}}</span>
    <div slot="label">
      <p style="color: #363636;">{{comment.content}}</p>
      <p>
        <span style="margin-right: 10px;">{{comment.pubdate | relativeTime}}</span>
        <van-button
          size="mini"
          type="default"
        >回复{{comment.reply_count}}</van-button>
      </p>
    </div>
    <van-icon slot="right-icon" />
  </van-cell>
  <!-- /当前评论 -->

  <van-divider>全部回复</van-divider>
  <!-- 对当前评论 回复列表 -->
  <van-list
    v-model="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="onLoad"
    >
    <van-cell
      v-for="(item, index) in list"
      :key="index"
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
        </p>
      </div>
    </van-cell>
  </van-list>
  <!-- 回复列表 -->

  <!-- 发布回复 -->
  <van-cell-group class="publish-wrap">
    <van-field
      clearable
      placeholder="请输入回复内容"
      v-model.trim="content"
    >
      <van-button
        slot="button"
        size="mini"
        type="info"
        @click="hAddReply"
      >发布回复</van-button>
    </van-field>
  </van-cell-group>
  <!-- /发布回复 -->
</div>

</template>
<script>
import { getComments, addComment } from '@/api/comment.js'
export default {
  name: 'CommentReply',
  props: {
    comment: {
      type: Object,
      required: true
    },
    articleId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      content: '', // 回复的内容
      offset: null, // 获取评论数据的偏移量,null不会在axios中传出去，表示从第一页开始读取数据
      list: [], // 评论列表
      loading: false, // 上拉加载更多的 loading
      finished: false // 是否加载结束
    }
  },
  created () {
    console.log('commentReply.vue创建了')
  },
  methods: {
    // 添加评论回复
    async hAddReply () {
      // 1. 判断
      if (this.content === '') {
        return
      }
      //  * target：评论的目标id（评论文章即为文章id，对评论进行回复则为评论id
      //  * content 评论内容
      //  * art_id  文章id，对评论内容发表回复时，需要传递此参数，表明所属文章id。对文章进行评论，不要传此参数。
      // 2. 调用接口
      const result = await addComment({
        target: this.comment.com_id.toString(),
        content: this.content,
        art_id: this.articleId
        // 方式1： 补充一个props，再从父组件中拿；
        // 方式2：直接从路由上拿 this.$route.params.id
      })
      // 3. 根据调用结果做一些反馈----更新视图
      // 3.1 直接从接口返回值中取出new_obj(它就表示当前评论回复的内容)， 添加list中
      //     加在list的头
      this.list.unshift(result.data.data.new_obj)
      // 3.2 把回复数+1
      this.comment.reply_count++

      this.$toast.success('回复成功')

      // 4. 清空内容
      this.content = ''
    },
    async onLoad () {
      //  * {
      //  *  type(必须) a或c 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
      //  *  source(必须) 源id，文章id或评论id
      //  *  offset(可选) 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
      //  *  limit(可选) 获取的评论数据个数，不传表示采用后端服务设定的默认每页数据量
      //  * }
      // 1. 请求数据
      const result = await getComments({
        type: 'c',
        source: this.comment.com_id.toString(),
        offset: this.offset
      })

      // 2. 把数据追加到列表中
      this.list.push(...result.data.data.results)

      // 3.加载状态结束
      this.loading = false

      // 4. 数据全部加载完成
      if (result.data.data.results.length === 0) {
        this.finished = true
      }

      // 5. 更新offset的值
      this.offset = result.data.data.last_id
    }
  }
}
</script>
<style lang="less" scoped>
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
