import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { temuRoutes } from './temu'
import { goodsRoutes } from './goods'
import { orderRoutes } from './order'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  temuRoutes,
  goodsRoutes,
  orderRoutes,
  resultRoutes,
  exceptionRoutes
]
