<template>
  <div class="article-container">
    <!-- 导航栏 -->
    <van-nav-bar
      fixed
      left-arrow
      @click-left="$router.back()"
      title="文章详情"
    ></van-nav-bar>
    <!-- /导航栏 -->

    <!-- 加载中 loading -->
    <van-loading class="article-loading" v-show="loading" />
    <!-- /加载中 loading -->

    <div v-if="is404" class="error">
      文章不见了！
    </div>
    <div v-else class="detail">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image round width="1rem" height="1rem" fit="fill" :src="article.aut_photo"/>
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate | relativeTime}}</p>
        </div>
        <van-button
          round
          size="small"
          type="info"
          @click="hSwitchFollow"
        >{{article.is_followed ? '取关' : '+ 关注'}}</van-button>
      </div>
      <div class="content" v-html="article.content">
        <!--  由于是正文是html标签，所以不能直接用插值，而要用v-html.
          <div>{{article.content}}</div>
        -->

      </div>
      <van-divider>END</van-divider>
      <div class="zan">
        <van-button round size="small"
        hairline
        type="primary"
        plain
        :icon="article.attitude === 1 ? 'good-job': 'good-job-o'"
        @click="hSwitchLike">{{article.attitude === 1 ? '取消点赞' : '点赞'}}</van-button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <van-button round size="small"
        hairline
        type="danger"
        plain
        icon="delete"
         @click="hSwitchDisLike">{{article.attitude === 0 ? '取消不喜欢' : '不喜欢'}}</van-button>
      </div>
    </div>
    <!-- /文章详情 -->

    <!-- 文章评论
      把文章编号传给子组件。由于文章编号是在路由中保存的，所以
      在当前页面上的所有组件都可以访问，理论上，这里的articleId可以不用传
      而在子组件的内部去直接获取this.$route.params.id。
    -->
    <article-comment :articleId="$route.params.id"></article-comment>
    <!-- 文章评论 -->

  </div>
</template>

<script>
import { followUser, unFollowUser } from '@/api/user.js'
import { getArticle, deleteLike, addLike, deleteDisLike, addDisLike } from '@/api/article.js'
import ArticleComment from './comment.vue'

export default {
  name: 'ArticleIndex',
  data () {
    return {

      is404: false,
      loading: true, // 控制加载中的 loading 状态
      article: {}
    }
  },
  components: { ArticleComment },
  created () {
    this.loadArticle()
  },
  methods: {
    async loadArticle () {
      try {
        const result = await getArticle(this.$route.params.id)
        // console.log(result)
        // 保存获取的文章详情
        this.article = result.data.data

        // 取消加载状态
        this.loading = false
      } catch (err) {
        this.loading = false
        console.dir(err)
        if (err && err.response && err.response.status === 404) {
          // alert('文章不见了')
          this.is404 = true
        }
      }
    },
    async hSwitchFollow () {
      // 根据当前is_followed来决定调用哪一个方法：
      // 如果is_followed是true，即当前是关注这个作者的，则点击动作就是要 取关
      try {
        if (this.article.is_followed) {
          await unFollowUser(this.article.aut_id)
        } else {
          await followUser(this.article.aut_id)
        }
        this.$toast.success('操作成功')
        // 更新视图
        // 1. 重新获取整个页面 （不采用，成本太高）
        // 2. 只更新本地的数据项（就是取反）
        //    采用。原因如果这个请求接口操作并没有报错，则说明后端已经把数据更改了
        //          这里视图上，直接修改就行了。
        this.article.is_followed = !this.article.is_followed
      } catch {
        // 失败之后的处理
      }
    },
    // 切换 是否 点赞
    async hSwitchLike () {
      // 根据当前attitude来决定调用哪一个方法：
      // 如果attitude是1，即当前给文章点赞的，则点击动作就是要 取消点赞
      if (this.article.attitude === 1) {
        await deleteLike(this.article.art_id.toString())
        this.article.attitude = -1
      } else {
        await addLike(this.article.art_id.toString())
        this.article.attitude = 1
      }
      this.$toast.success('操作成功')
      // 更新视图
      // 1. 重新获取整个页面 （不采用，成本太高）
      // 2. 只更新本地的数据项（就是取反: -1 <-------> 1）
      //    采用。原因如果这个请求接口操作并没有报错，则说明后端已经把数据更改了
      //          这里视图上，直接修改就行了。
      // this.article.attitude = this.article.attitude * -1
    },
    // 切换 是否 不喜欢
    async hSwitchDisLike () {
      // 根据当前attitude来决定调用哪一个方法：
      // 如果attitude是0，即当前给文章 添加了 不喜欢，则点击动作就是要 取消 不喜欢
      if (this.article.attitude === 0) {
        await deleteDisLike(this.article.art_id.toString())
        this.article.attitude = -1
      } else {
        await addDisLike(this.article.art_id.toString())
        this.article.attitude = 0
      }
      this.$toast.success('操作成功')
    }
  }
}
</script>

<style scoped lang='less'>
.article-container{
  position: absolute;
  left: 0;
  top: 0;
  overflow-y: scroll;
  width: 100%;
  height: 100%;
}
.article-loading {
  padding-top: 100px;
  text-align: center;
}
.error{
  padding-top: 100px;
  text-align: center;
}
.detail {
  padding: 50px 10px;
  .title {
    font-size: 16px;
  }
  .zan{
    text-align: center;
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.3;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    font-size:14px;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
  }
}
</style>
