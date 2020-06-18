/**
 * 处理文章相关操作
 */
import ajax from '@/utils/request'

/**
 * 获取某个频道下的文章列表
 * @param {*} channelId 频道id
 * @param {*} timestamp 时间戳
 */
export const getArticles = (channelId, timestamp) => {
  return ajax({
    method: 'GET',
    url: '/app/v1_1/articles',
    params: {
      channel_id: channelId,
      timestamp: timestamp,
      with_top: 1
    }
  })
}

/**
 * 文章更多操作-----不喜欢 指定id 的文章
 * @param {*} articleId 文章id
 */
export const dislikeArticle = articleId => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/article/dislikes',
    data: {
      target: articleId
    }
  })
}

/**
 * 举报文章
 * @param {*} articleId 文章类型
 * @param {*} type 举报类型编号
 */
export const reportArticle = (articleId, type) => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/article/reports',
    data: {
      target: articleId,
      type
    }
  })
}

/**
 * 获取文章详情
 * @param {*} id 文章编号
 */
export const getArticle = id => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/articles/' + id
  })
}

/**
 * 取消点赞
 * @param {*} id 文章编号
 */
export const deleteLike = id => {
  return ajax({
    method: 'DELETE',
    url: '/app/v1_0/article/likings/' + id
  })
}

/**
 * 添加点赞
 * @param {*} id 文章编号
 */
export const addLike = id => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/article/likings',
    data: {
      target: id
    }
  })
}

/**
 * 取消不喜欢
 * @param {*} id 文章编号
 */
export const deleteDisLike = id => {
  return ajax({
    method: 'DELETE',
    url: '/app/v1_0/article/dislikes/' + id
  })
}

/**
 * 添加不喜欢
 * @param {*} id 文章编号
 */
export const addDisLike = id => {
  return ajax({
    method: 'POST',
    url: '/app/v1_0/article/dislikes',
    data: {
      target: id
    }
  })
}
