import request from '@/utils/http'
import { fetchGetTemuList } from './system-manage'

// 获取商品列表
export function fetchGetGoodsList(params: Api.Goods.GoodsSearchParams) {
  return request.get<Api.Goods.GoodsList>({
    url: '/api/temu/goods',
    params
  })
}

// ================= 自建商品接口 =================

// 获取自建商品列表
export function fetchSelfGoodsList(params: Api.SelfGoods.SelfGoodsSearchParams) {
  return request.get<Api.SelfGoods.SelfGoodsListResponse>({
    url: '/api/self_goods',
    params
  })
}

// 获取自建商品详情
export function fetchSelfGoodsDetail(id: number) {
  return request.get<Api.SelfGoods.SelfGoodsDetailItem>({
    url: `/api/self_goods/${id}`
  })
}

// 创建/更新自建商品
export function saveSelfGoods(data: FormData) {
  return request.post<Api.SelfGoods.SelfGoodsDetailItem>({
    url: '/api/self_goods',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除自建商品
export function deleteSelfGoods(id: number) {
  return request.del<{ code: number; message: string }>({
    url: `/api/self_goods/${id}`
  })
}

// 分配商品给 Temu 账号
export function assignSelfGoods(data: Api.SelfGoods.AssignParams) {
  return request.post<{ code: number; message: string }>({
    url: '/api/self_goods/assign',
    data
  })
}

// 取消分配商品
export function unassignSelfGoods(data: Api.SelfGoods.UnassignParams) {
  return request.post<{ code: number; message: string }>({
    url: '/api/self_goods/unassign',
    data
  })
}

export { fetchGetTemuList }
