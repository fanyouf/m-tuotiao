// 评论相关功能封装

import ajax from '@/utils/request.js'

/**
 * 添加评论
 * target：评论的目标id（评论文章即为文章id，对评论进行回复则为评论id
 * content 评论内容
 * art_id  文章id，对评论内容发表回复时，需要传递此参数，表明所属文章id。对文章进行评论，不要传此参数。
 * data:{
      target: targetId,
      content,
      art_id: 文章编号
    }
 */
export const addComment = (data) => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/comments',
    data
  })
}

/**
 * 获取评论
 * {
 *  type(必须) a或c 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
 *  source(必须) 源id，文章id或评论id
 *  offset(可选) 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
 *  limit(可选) 获取的评论数据个数，不传表示采用后端服务设定的默认每页数据量
 * }
 */
export const getComments = params => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/comments',
    params
  })
}

/**
 * 对评论点赞
 * @param {*} commentId 评论的id
 */
export const addCommentLike = commentId => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/comment/likings',
    data: {
      target: commentId
    }
  })
}

/**
 * 取消对评论的点赞
 * @param {*} commentId 评论的id
 */
export const deleteCommentLike = commentId => {
  return ajax({
    method: 'DELETE',
    url: '/app/v1_0/comment/likings/' + commentId
  })
}
