import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

import Page1 from '@/views/page1/index.vue'
const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Page1
    }
  ]
})
export default router
