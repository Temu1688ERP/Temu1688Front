import request from '@/utils/http'

// 获取订单列表
export function fetchGetOrderList(params: Api.Order.OrderSearchParams) {
  return request.get<Api.Order.OrderList>({
    url: '/api/orders',
    params
  })
}
