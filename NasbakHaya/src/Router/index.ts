import { createRouter, createWebHashHistory } from 'vue-router'
import InputOrder from '../pages/InputOrder.vue'
import AdminPage from '../pages/AdminView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/order'
    },
    {
      path: '/order',
      name: 'Order',
      component: InputOrder
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminPage
    }
  ]
})

export default router
