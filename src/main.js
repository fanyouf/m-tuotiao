import Vue from 'vue'
import App from './App.vue'
// import Vant from 'vant'
// import { Lazyload } from 'vant'

// 在vant这模块中如下两种导出模块的方式同时存在:
// export default  默认导出
// export {Lazyload}  普通导出
//
// 在导入的时，XXX ---> Vant
//            Lazyload 就是 普通导出 Lazyload
// import Vant, { Lazyload } from 'vant'

import 'vant/lib/index.css'
import { relativeTime } from '@/utils/date-time.js'
// 全局样式
import '@/styles/index.less'

// 引入路由
import router from './router'
// 引入vuex
import store from './store'

// 它会根据的手机尺寸来调整rem的基准值：html标签上的font-size。
import 'amfe-flexible'

import {
  Button,
  Tabbar,
  TabbarItem,
  Form,
  Field,
  NavBar,
  Toast,
  Tabs,
  Tab,
  List,
  Lazyload,
  CellGroup,
  Cell,
  Icon,
  Grid,
  GridItem,
  Popup,
  Row,
  Col,
  Tag,
  Image,
  Divider,
  PullRefresh,
  ActionSheet,
  Loading,
  Search
} from 'vant'
// Vue.use(Lazyload)

// Vue.use(Vant)
Vue.use(Button)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Form)
Vue.use(Field)
Vue.use(NavBar)
Vue.use(Toast)
Vue.use(Tabs)
Vue.use(Tab)
Vue.use(List)
Vue.use(Lazyload)
Vue.use(CellGroup)
Vue.use(Cell)
Vue.use(Icon)
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(Popup)
Vue.use(Row)
Vue.use(Col)
Vue.use(Tag)
Vue.use(Image)
Vue.use(PullRefresh)
Vue.use(ActionSheet)
Vue.use(Divider)
Vue.use(Loading)
Vue.use(Search)

// 定义一个全局过滤器
Vue.filter('relativeTime', relativeTime)
Vue.config.productionTip = false

// 使用事件总线
// new Vue()得到一个全新的vue实例，用它来充当事件总线
// 挂载到Vue的原型对象上，
// 则在所有的组件中都可以通过this.$eventBus来访问这个事件总结
Vue.prototype.$eventBus = new Vue()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
