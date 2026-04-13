import { createRouter, createWebHashHistory } from 'vue-router'
import InputOrder from '../pages/InputOrder.vue'
import AdminPage from '../pages/AdminView.vue'
import InputOrderSiang from '../pages/InputOrderSiang.vue'
import InputOrderEcare from '../pages/InputOrderEcare.vue'


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
      path: '/orderSiang',
      name: 'OrderSiang',
      component: InputOrderSiang
    },
    {
      path: '/orderEcare',
      name: 'OrderEcare',
      component: InputOrderEcare
    },
    {
      path: '/admin',
      name: 'Admin', 
      component: AdminPage
    }
  ]
})

export default router
