import { AppRouteRecord } from '@/types/router'

export const financeRoutes: AppRouteRecord = {
  path: '/finance',
  name: 'Finance',
  component: '/index/index',
  meta: {
    title: '财务管理',
    icon: 'ri:money-dollar-circle-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'payments',
      name: 'PaymentAudit',
      component: '/system/temu/modules/payment-list',
      meta: {
        title: '付款单审核',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'payment-list',
      name: 'PaymentList',
      component: '/finance/payment-list',
      meta: {
        title: '所有付款单',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
