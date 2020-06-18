// 封装搜索功能
import ajax from '@/utils/request.js'

/**
 * 根据搜索关键字获取搜索建议
 * @param {String} keyword 关键字
 */
export const getSuggestion = keyword => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/suggestion',
    params: {
      q: keyword
    }
  })
}

/**
 * 获取搜索结果
 * 参数：
 * page     否 页数，不传默认为1
 * per_page 否 每页数量，不传每页数量由后端决定
 * q        是 搜索关键词
 * @param {String} keyword 关键字
 * @param {*} page 页码
 */
export const getSearch = (keyword, page) => {
  return ajax({
    method: 'GET',
    url: '/app/v1_0/search',
    params: {
      q: keyword,
      page
    }
  })
}
