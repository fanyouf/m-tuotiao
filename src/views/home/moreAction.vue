<template>
  <div class="more-action">
    <van-cell-group v-if="!isReport">
      <!-- 状态一 -->

      <!-- 直接抛出事件，具体的功能由父组件去实现 -->
      <van-cell @click="$emit('dislike')">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true">举报垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <!-- 状态二 -->
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
      <!-- 点击事件，向父组件抛出事件，并传递数据：举报的类型编号 -->
      <van-cell
        v-for="item in list"
        :key="item.value"
        @click="$emit('report',item.value)">{{item.label}}</van-cell>
    </van-cell-group>
  </div>
</template>

<script>
// 从常量模块中导入
import reportTypeList from '@/constant/report.js'
// console.log(reportTypeList)
export default {
  data () {
    return {
      // 定义了数据项，才能用v-for
      list: reportTypeList,
      isReport: false
    }
  }
}
</script>

<style lang='less' scoped>
.more-action {
  border-radius: 4px;
}
</style>
