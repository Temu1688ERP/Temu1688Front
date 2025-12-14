import { AppRouteRecord } from '@/types/router'

export const goodsRoutes: AppRouteRecord = {
  path: '/goods',
  name: 'Goods',
  component: '/index/index',
  meta: {
    title: '商品管理',
    icon: 'ri:shopping-bag-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'list',
      name: 'GoodsList',
      component: '/goods/list',
      meta: {
        title: '商品列表',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
