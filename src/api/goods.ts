import request from '@/utils/http'

// 获取商品列表
export function fetchGetGoodsList(params: Api.Goods.GoodsSearchParams) {
  return request.get<Api.Goods.GoodsList>({
    url: '/api/temu/goods',
    params
  })
}
