/**
 * 封装模块 使用localStorage实现持久化
 */

/**
* 从localStorage中取出一项数据
* @param {*} name  要取出的数据的名字
*/
export const getItem = name => {
  return JSON.parse(localStorage.getItem(name))
}

/**
 * 向localStorage中设置一项数据
 * @param {*} name 属性名
 * @param {*} obj  对象。要保存的值。
 */
export const setItem = (name, obj) => {
  localStorage.setItem(name, JSON.stringify(obj))
}

/**
 * 从localStorage中删除一项数据
 * @param {*} name 属性名
 */
export const removeItem = name => {
  localStorage.removeItem(name)
}
