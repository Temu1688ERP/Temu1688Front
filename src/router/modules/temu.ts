import { AppRouteRecord } from '@/types/router'

export const temuRoutes: AppRouteRecord = {
  path: '/temu',
  name: 'Temu',
  component: '/index/index',
  meta: {
    title: 'TEMU管理',
    icon: 'ri:store-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'accounts',
      name: 'TemuAccounts',
      component: '/system/temu',
      meta: {
        title: '账号管理',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
