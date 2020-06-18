<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <!-- ref如果是加在一个子组件上，就可以通过this.$refs.ref名来获取子组件
    ref如果是加在一个普通标签上，就可以通过this.$refs.ref名来获取dom -->
    <div class="chat-list" ref="list">
      <div class="chat-item"
      v-for="(item,idx) in list"
      :key="idx"
      :class="item.name==='xz' ? 'left' : 'right'"
      >
        <!-- template:它在逻辑上表示一个整体，但是，在渲染成dom之后， 不会生成一个具体的元素 -->
        <template v-if="item.name === 'xz'">
          <van-image fit="cover" round src="https://img.yzcdn.cn/vant/cat.jpeg" />
          <div class="chat-pao">{{item.msg}}</div>
        </template>
        <template v-if="item.name === 'me'">
          <div class="chat-pao">{{item.msg}}</div>
          <van-image fit="cover" round :src="$store.state.photo" />
        </template>
      </div>
      <!-- 左侧是机器人小智
      <div class="chat-item left">
        <van-image fit="cover" round src="https://img.yzcdn.cn/vant/cat.jpeg" />
        <div class="chat-pao">hi，你好！</div>
      </div>

      右侧是当前用户
      <div class="chat-item right">
        <div class="chat-pao">dddddd</div>
        <van-image  fit="cover" round :src="$store.state.photo" />
      </div>
      -->
    </div>

    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="word" placeholder="说点什么...">
        <span @click="hSend()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
// 引入socket.io-client，使用它提供的websocket功能
import io from 'socket.io-client'
// 1. 创建组件时，建立websocket连接
export default {
  name: 'UserChat',
  data () {
    return {
      list: [
        // {
        //   name: 'xz', msg: '你好，我是小智', timestamp: Date.now()
        // },
        // {
        //   name: 'me', msg: '我是编程小王子！', timestamp: Date.now()
        // },
        // {
        //   name: 'xz', msg: '你以为会在百度上抄代码，就是程序员了吗？', timestamp: Date.now()
        // },
        // {
        //   name: 'me', msg: '不是这样吗？', timestamp: Date.now()
        // }
      ],
      word: ''
    }
  },
  created () {
    // 这里只是把socket当作一个普通的属性名，它不一定非常要写在data数据项中
    this.socket = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.$store.state.tokenInfo.token
      }
    })

    this.socket.on('connect', () => {
      console.log('与websocket服务器连接成功')
      this.list.push({
        name: 'xz',
        msg: '我准备好了',
        timestamp: Date.now()
      })
    })
    // 接收从服务器返回的信息
    this.socket.on('message', obj => {
      console.log('服务回来的消息', obj, this)
      // 把消息添加到list
      this.list.push({
        name: 'xz',
        msg: obj.msg,
        timestamp: obj.timestamp
      })

      // this.$refs.list.scrollHeight 表示当前最新的list中高度。
      // 但是，vue对dom的更新是异步的：this.list.push()给数据项增加了一个，会让整个dom中多一项
      // 会让高度增加， 只不过这个过程要在updated之后才生效。

      // 更新一下滚动条,让它到达最底部
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      // document.querySelector('.chat-list').scrollTop = document.querySelector('.chat-list').scrollHeight
      })
    })
  },
  methods: {
    hSend () {
      // 1. 简单判断内容是否为空
      if (this.word === '') {
        return
      }
      // console.log(this.word)
      // 2. 向websocket服务器发消息
      const info = {
        msg: this.word,
        timestamp: Date.now()
      }
      this.socket.emit('message', info)

      // 3. 把本次的内容添加到list
      this.list.push({
        name: 'me',
        msg: info.msg,
        timestamp: info.timestamp
      })
      // console.log(this.socket)
      // 4. 清空留言区域
      this.word = ''

      // 5. 更新一下滚动条,让它到达最底部
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight

        // document.querySelector('.chat-list').scrollTop = document.querySelector('.chat-list').scrollHeight
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
