// 对dayjs进行封装
import dayjs from 'dayjs'

// 引入一个插件。在inpm i dayjs时，就已经把这个插件下载了
import rTime from 'dayjs/plugin/relativeTime'

// 引入中文语言包
import 'dayjs/locale/zh-cn'
// 固定写法：使用dayjs的插件
dayjs.extend(rTime)

// 全局使用简体中文
dayjs.locale('zh-cn')

export const formateTime = function (val) {
  return dayjs().format('DD/MM/YYYY')
}

/**
 * 转换相对时间
 * @param {*} yourTime 要计算的时间
 */
export const relativeTime = function (yourTime) {
  // 使用dayjs提供的api对用户传入的时间进行格式化
  // 具体是：得到一个相对时间
  return dayjs().to(dayjs(yourTime))
}
