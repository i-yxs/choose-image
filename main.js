import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'

Vue.prototype = Object.assign(Vue.prototype, {
    globalData: {},
});

const app = new Vue({
    ...App
})
app.$mount()


