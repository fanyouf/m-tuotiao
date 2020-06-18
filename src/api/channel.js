/**
 * 处理频道相关操作
 */
import ajax from '@/utils/request'

/**
 * 获取频道列表
 */
export const getChannels = () => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}

/**
 * 获取系统中的所有频道
 */
export const getAllChannels = () => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/channels'
  })
}

/**
 * 间接实现添加订阅频道的功能：把当前的用户选中所有频道列表传入
 * @param {*} channels 数组
 * [{id:频道id1, seq:1}, {id:频道id2, seq:2}, {id:频道id3, seq:3}]
 */
export const addChannel = channels => {
  return ajax({
    method: 'PUT',
    url: '/app/v1_0/user/channels',
    data: {
      channels
    }
  })
}

/**
 * 删除频道
 * @param {*} channelId 要删除的频道id
 */
export const deleteChannel = channelId => {
  return ajax({
    method: 'DELETE',
    url: '/app/v1_0/user/channels',
    data: {
      channels: [channelId]
    }
  })
}
