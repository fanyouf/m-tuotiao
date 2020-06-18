<template>
  <div class='login'>
    <!-- 导航栏 -->
    <van-nav-bar
      title="黑马头条-登陆"
    />

    <!-- 表单部分
      error-message： 页面上给出错误提示
    -->
    <van-cell-group>
      <van-field
        v-model.trim="userInfo.mobile"
        required
        label="手机号"
        placeholder="请输入手机号"
        :error-message="errInfo.mobile"
      />
      <van-field
        v-model.trim="userInfo.code"
        required
        type="password"
        label="密码"
        placeholder="请输入密码号"
        :error-message="errInfo.code"
      />
    </van-cell-group>
        <!-- error-message="密码格式错误" -->

    <!-- 登陆按钮 -->
    <div class="btn-wrap">
      <van-button type="info" class="btn" @click="hLogin">登陆</van-button>
    </div>
  </div>
</template>

<script>
import { userLogin } from '@/api/user.js'
export default {
  name: 'LoginIndex',
  data () {
    return {
      userInfo: {
        // 下面的具体的表单字段mobile,code是参考接口文档中的要求来写的
        // 理论上，这里只要合法变量名就行，但是，为了后端接口保存一致，建立和接口文档中的要求写一样的
        mobile: '13912345678',
        code: '246810'
      },
      errInfo: {
        mobile: '',
        code: ''
      }
    }
  },
  methods: {
    // 自行定义验证方法
    validateUserInfo () {
      const { mobile, code } = this.userInfo
      if (mobile === '') {
        this.errInfo.mobile = '手机号不能为空'
        return false
      }
      if (code === '') {
        this.errInfo.code = '密码不能为空'
        return false
      }
      return true
    },
    async hLogin () {
      // 1. 收集用户信息
      // 2. 验证是否为空,格式......
      // 3. 发ajax

      if (this.validateUserInfo() === false) {
        return
      }
      // 在发ajax登陆之前加loading
      this.$toast.loading({
        message: '登陆中.....', // 提示文字
        mask: true, // 整体添加一个遮罩
        duration: 0 // 0表示这个提示不会消失,可以用一个新的toast来覆盖它
      })

      const { mobile, code } = this.userInfo
      try {
        const result = await userLogin(mobile, code)
        // ajax结束之后，取消loding ： 用一个新提示来覆盖之前的loading
        console.log(result)
        //  {refresh_token: "", token: ""}
        this.$toast.success('登陆成功')

        // 调用mutation保存token信息到vuex中
        this.$store.commit('mSetTokenInfo', result.data.data)

        // 根据当前路由参数，决定跳到哪里去
        const jumpto = this.$route.query.backto || '/'
        this.$router.push(jumpto)
      } catch (err) {
        console.log(err)
        // ajax结束之后，取消loding ： 用一个新提示来覆盖之前的loading
        this.$toast.fail('登陆失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .login {
    // 让登陆按钮居中
    .btn-wrap {
      padding:20px;
      .btn {
        width: 100%;
        background-color: #6db4fb;
        color: #fff;
      }
    }
  }
</style>
