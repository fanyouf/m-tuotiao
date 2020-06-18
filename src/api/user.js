/**
 * 处理 user 相关的操作
 */

import ajax from '@/utils/request'

/**
 * 用户登陆
 * @param {*} mobile 手机号
 * @param {*} code 密码
 */
export const userLogin = (mobile, code) => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/authorizations',
    data: {
      mobile, code
    }
  })
}

/**
 * 获取用户个人信息
 */
export const userGetInfo = () => {
  return ajax({
    method: 'get',
    url: '/app/v1_0/user/profile'
  })
}

/**
 * 关注用户
 * @param {*} userId 用户编号
 */
export const followUser = userId => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/user/followings',
    data: {
      target: userId
    }
  })
}

/**
 * 取消关注用户
 * @param {*} userId 用户编号
 */
export const unFollowUser = userId => {
  return ajax({
    method: 'DELETE',
    url: '/app/v1_0/user/followings/' + userId
  })
}

/**
 * 获取用户自已的信息
 */
export const getInfo = () => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/user'
  })
}

/**
 * 修改用户信息，把需要修改内容传入即可。
 * data {
    name  非必须 昵称
    gender  非必须 性别，0-男，1-女
    birthday  非必须 生日，格式'2018-12-20'
  }
 */
export const updateUserInfo = data => {
  return ajax({
    method: 'PATCH',
    url: '/app/v1_0/user/profile',
    data
  })
}

/**
 * 修改用户的头像信息
 * @param {*} formData formData格式的对象
 */
export const updatePhoto = (formData) => {
  return ajax({
    method: 'PATCH',
    url: '/app/v1_0/user/photo',
    data: formData
  })
}
