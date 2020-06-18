<template>
  <div class="channel-edit">
    <!-- 当前登陆用户已经订阅的频道 -->
    <div class="channel">
      <!--
        @click="editing=!editing" : 切换
        -->
      <van-cell title="我的频道" :border="false">
          <van-button
          size="mini"
          type="info"
          @click="editing=!editing">{{ editing ? '取消': '编辑'}}</van-button>
      </van-cell>

      <!-- 当前的频道下标与传入的prop相等，就添加cur类，实现高亮 -->
      <van-grid>
        <van-grid-item
        v-for="(item, idx) in channels"
        :key="item.id"
        @click="hClickMyChannel(item)"
        :class="{'cur': idx === activeIndex}"
        >
          <span>{{item.name}}</span>
          <!-- 推荐频道的下标0，它是不能被删除的 -->
          <van-icon v-show="editing && idx!==0" name="cross" class="btn"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
     <!-- 当前登陆用户没有订阅的频道 -->
    <div class="channel">
      <van-cell title="可选频道" :border="false"></van-cell>
      <van-grid>
        <van-grid-item
        v-for="item in cRecommendChannels"
        :key="item.id"
        @click="hAddChannel(item)">
          <span>{{item.name}}</span>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script>
import { getAllChannels, addChannel, deleteChannel } from '@/api/channel.js'
export default {
  name: 'ChannelEdit',
  // props: ['channels', 'activeIndex'],
  props: {
    channels: {
      type: Array, // 必须传入数组
      required: true // 必须要传入值
      // default: () => {
      //   return []
      // }
    },
    activeIndex: {
      type: Number,
      required: true
      // default: 0
    }
  },
  data () {
    return {
      editing: false, // 是否处于编辑状态
      allChannels: [] // 保存所有频道（并不会包含那个特殊的 推荐频道）
    }
  },
  created () {
    this.loadAllChannels()
  },
  // 需要两个已有两数据的基础上加工（减法）出来一个新数据，再这个新数据用v-for循环显示出来
  // allChannels - channels
  // 1. 如何来保存这个新数据？
  //   A. 直接在data设置一个新数据项。
  //   B. 补充一个计算属性
  computed: {
    cRecommendChannels () {
      // 公式： allChannels - channels
      // 可选频道 = 所有频道 除去 已订阅的频道
      // 本质：如何从一个数组中减去另一个数组？
      const arr = this.allChannels.filter(channel => {
        // 只保留在 没有在 已订阅的频道中出现的频道
        const idx = this.channels.findIndex(item => item.id === channel.id)
        // 如果找到，idx肯定不是-1
        // 如果找不到，idx 就是-1
        return idx === -1
      })
      return arr
    }
  },
  methods: {
    // 用户在推荐频道上点击了某一项
    async hAddChannel (channel) {
      // 1. 组装数据. 改造成接口参数要求的格式
      //   1). 把当前点击的频道放到已选频道的后面
      let curChannelsNow = [...this.channels, channel]
      //   2). 后端要求，不要推荐频道。它就是一个
      curChannelsNow.splice(0, 1) // 删除第一个
      //   3). 把[{id,name}, ...] 改成 [{id, seq}, ...]
      curChannelsNow = curChannelsNow.map((item, idx) => {
        return { id: item.id, seq: idx }
      })
      console.log(curChannelsNow)
      // 2. 调用接口
      const result = await addChannel(curChannelsNow)
      console.log(result)

      // 3. 更新页面： 修改已订阅频道
      //  直接在channels的后面添加当前这一项
      this.channels.push(channel)
      // (1) 它给 我的频道中添加了 一项。导致视图的变化。
      // (2) 由于可选频道是一个计算属性，所以 我的频道 多了一次，则可选频道就会少一项。
      // (3) 它会直接修改父组件中的频道列表。
      //     原因：父组件把channels当作prop传入的。由于这个prop的值是一个数组，它是一个引用数据类型。
      //          所以在子组件中修改会直接影响到父组件中的数据。
    },
    // 用户在我的频道上点击了某一项
    async hClickMyChannel (channel) {
      // 在编辑状态点击
      if (this.editing) {
        if (channel.id === 0) {
          // 说明是推荐，不能删除
          return
        }
        // 1. 请求接口，不再订阅当前频道
        const result = await deleteChannel(channel.id)
        console.log(result)
        // 2. 更新视图：从当前频道列表中删除这一项
        console.log('在编辑状态点击', channel)
        //  (1) 找出下标
        const idx = this.channels.findIndex(it => it.id === channel.id)
        //  (2) 删除
        if (idx !== -1) {
          this.channels.splice(idx, 1)
        }

        // 如果当前删除的频道在 此时的活动频道之前，则要更新一下父组件中的活动频道的下标 ，具体就是 -1
        if (idx < this.activeIndex) {
          alert('父组件中activeIndex要-1')
          this.$emit('updateCurIndex', this.activeIndex - 1)
        }
      } else {
        // 普通情况下点击
        // 期望的目标是：
        // 1. 整个频道管理弹层收起来
        this.$emit('close')
        // 2. 在父组件index.vue中跳转到当前频道项
        this.$emit('updateCurChannel', channel)
      }
    },
    async loadAllChannels () {
      const result = await getAllChannels()
      // console.log(result)
      this.allChannels = result.data.data.channels
    }
  }
}
</script>

<style lang="less" scoped>
  .channel{
    padding:15px;
    font-size:14px;
  }
  .btn {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 24px;
  }
  .cur {
    color: red;
    font-weight: bold;

  }
</style>
