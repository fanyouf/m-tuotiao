module.exports = {
  // configureWebpack 配置是vuecli中提供的一个配置项
  // 用来对webpack打包做更加精细的控制
  // 后面的函数中，config就是当前打包时采用的webpack配置
  // 我们可以在这个函数中，对config进行修改
  configureWebpack: (config) => {
    // console.log(config)
    // config.mode = 'development'
    // 如果当前是生产模式
    if (process.env.NODE_ENV === 'production') {
      // 在webpack的配置对象 config的 optimization属性的minimizer数组的第一个元素的options中设置....
      // 在打包之后的js中去掉console.log
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  // https://cli.vuejs.org/zh/config/#publicpath
  // 设置打包后访问资源方式，以是相对路径来访问
  // dist目录下的index.html就可以直接双击打开
  publicPath: './'
}
