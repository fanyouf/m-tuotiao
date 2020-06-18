<template>
  <div class="container">
    <!-- 1.顶部的工具条 -->
    <van-nav-bar left-arrow @click-left="$router.back()" title="编辑资料"></van-nav-bar>

    <!-- 2.具体的修改项 -->
    <van-cell-group>
      <van-cell is-link title="头像" @click="hShowImage" center>
        <van-image
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="user.photo"
        />
      </van-cell>

      <!-- 用来选中本地文件
        如何获取这个file文本域中选中的文件？
        把它隐藏起来
      -->
      <input type="file" hidden @change="hPhotoChange" ref="refPhoto" />

      <van-cell is-link title="名称" :value="user.name" @click="showName=true"/>
      <van-cell is-link title="性别" :value="user.gender === 0?'男':'女'" @click="showGender=true"/>
      <van-cell is-link title="生日" :value="user.birthday" @click="showBirthday=true"/>
    </van-cell-group>

    <!-- 修改名字 -->
    <van-dialog @confirm="hSaveName"  v-model="showName" title="修改名字" show-cancel-button>
      <van-field v-model="newName" />
      <!-- 直接放一个表单元素 -->
    </van-dialog>

    <!-- 修改性别 -->
    <van-popup v-model="showGender" position="bottom">
      <van-nav-bar
          title="修改性别"
          left-text="取消"
          @click-left="showGender=false"
      >
      </van-nav-bar>

      <van-cell is-link title="男" @click="hSaveGender(0)" />
      <van-cell is-link title="女" @click="hSaveGender(1)" />
    </van-popup>

    <!-- 修改生日 -->
    <van-popup v-model="showBirthday" position="bottom">
      <van-nav-bar title="修改生日"></van-nav-bar>
      <van-datetime-picker
        @cancel="showBirthday=false"
        @confirm="hSaveBirthday"
        v-model="newDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { userGetInfo, updateUserInfo, updatePhoto } from '@/api/user.js'
export default {
  name: 'userProfile',
  data () {
    return {
      // 控制弹层
      showName: false,
      showGender: false,
      showBirthday: false,

      // 当前用户的信息
      user: {},
      newName: '', // 修改后的新名字
      // 修改后新生日
      newDate: new Date(),
      minDate: new Date(1990, 0, 10), // dateTime-picker中最小时间
      maxDate: new Date() // 当前时间
    }
  },
  created () {
    this.loadUserProfil()
  },
  methods: {
    hShowImage () {
      // 要去调出选择文件窗口
      // 相当于点击input框
      // console.log(this.$refs.refPhoto)
      this.$refs.refPhoto.click()
    },
    async hPhotoChange () {
      try {
        // todo :加loading...
        // 1. 获取用户选中的图片文件
        //    this.$refs.refPhoto用来获取对input type="file"的引用
        //    .files[0] :files是input的一个属性，用来保存用户选中的文件
        //          [0] 表示集合中的第一项。
        const file = this.$refs.refPhoto.files[0]
        if (!file) {
          return
        }
        console.dir(file)

        // 2. 调用接口，上传
        // 由于这里是上传文件，所以采用FormData对象来包装参数
        const fd = new FormData()
        fd.append('photo', file)
        const result = await updatePhoto(fd)
        console.log(result)
        // 3. 更新视图
        this.user.photo = result.data.data.photo

        // 4.保存头像地址到vuex
        this.$store.commit('mSetPhoto', this.user.photo)

        this.$toast.success('修改头像成功')
      } catch (err) {
        console.log(err)
      }
    },
    async hSaveBirthday () {
      console.log(this.newDate)
      // dayjs(日期字符串，日期对象) format() 格式化
      // YYYY : 4位年份
      // MM: 月份
      // DD: 几号
      // 因为接口需要，这里要对日期进行格式化
      const birthday = dayjs(this.newDate).format('YYYY-MM-DD')
      try {
        // 1. 调用接口
        await updateUserInfo({
          birthday
        })
        // 2. 关闭弹层
        this.showBirthday = false
        // 3. 修改本地的信息
        this.user.birthday = birthday
      } catch (err) {
        console.log(err)
      }
    },
    async hSaveGender (val) {
      try {
        await updateUserInfo({
          gender: val
        })
        // 1. 修改本地用户信息
        this.user.gender = val
        // 2. 关闭弹层
        this.showGender = false
      } catch (err) {
        console.log(err)
      }
    },
    async hSaveName () {
      // 保存名字
      // 1. 判断是否为空
      if (this.newName === '') {
        // todo: 如果验证不通过，就不要关闭弹层
        this.$toast.fail('不能保存空名字')
        return
      }
      // 2. 判断是否与原名字相同
      if (this.newName === this.user.name) {
        return
      }
      try {
        await updateUserInfo({
          name: this.newName
        })
        // 更新本地名字
        this.user.name = this.newName
        // 清空名字
        this.newName = ''
      } catch (err) {
        // 你可能需要根据err中的具体提示，来给用户不同的提示
        this.$toast.fail('修改名字失败')
      }
    },
    async loadUserProfil () {
      const result = await userGetInfo()
      console.log(result)
      // 保存数据
      this.user = result.data.data
      // 设置newName的初值
      this.newName = this.user.name
    }
  }
}
</script>

<style lang="less">
.van-nav-bar__text{
  color:#fff;
}
</style>
