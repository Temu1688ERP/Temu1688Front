import request from '@/utils/http'

export interface CustomerTokenParams {
  mobile: string
  password: string
}

export interface CustomerTokenResponse {
  token: string
}

export interface CustomerReceipt {
  id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  account_id: number
  status: string
  goods_total: number
  total_price: string
  received_price: string
}

export interface CustomerReceiptListResponse {
  total: number
  data: CustomerReceipt[]
}

export interface ReceiptGoods {
  id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  account_id: number
  goods_title: string
  goods_id: string
  product_id: string
  skc_id: string
  sku_id: string
  goods_image: string
  goods_cat: string
  sku_image: string
  sku_spec_list: Record<string, string>
  properties: Record<string, string>
  categories: string[]
  price: string
  search: string
}

export interface ReceiptDetailItem {
  id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  account_id: number
  status: string
  goods_id: number
  price: string
  num: number
  received: string
  goods: ReceiptGoods
}

export interface CustomerReceiptDetailResponse {
  total: number
  data: ReceiptDetailItem[]
}

// 上传小票请求参数
export interface UploadTicketParams {
  receipt_id: string
  file: File
  amount: string
  remark?: string
}

// 上传小票响应
export interface UploadTicketResponse {
  code: number
  msg: string
  data: {
    id: number
    receipt_id: number
    amount: string
    status: string
    created_at: string
  }
}

// 获取供货商 token
export function fetchCustomerToken(params: CustomerTokenParams) {
  return request.post<CustomerTokenResponse>({
    url: '/api/customer/receipt/get_token',
    params
  })
}

// 获取供货商批次列表
export function fetchCustomerReceiptList() {
  return request.get<CustomerReceiptListResponse>({
    url: '/api/customer/receipt/select'
  })
}

// 获取供货商批次详情
export function fetchCustomerReceiptDetail(id: number) {
  return request.get<CustomerReceiptDetailResponse>({
    url: '/api/customer/receipt/detail',
    params: { id }
  })
}

// 上传小票
export function fetchUploadTicket(data: FormData) {
  return request.post<UploadTicketResponse>({
    url: '/api/customer/receipt/ticket/upload',
    data
  })
}

// 付款记录项
export interface PaymentRecord {
  id: number
  receipt_id: number
  amount: string
  image_url: string
  status: string
  remark: string
  created_at: string
}

// 付款记录列表响应
export interface PaymentListResponse {
  code: number
  msg: string
  data: {
    total: number
    data: PaymentRecord[]
  }
}

// 付款记录列表查询参数
export interface PaymentListParams {
  id?: number
  receipt_id?: number
  status?: 'pending' | 'rejected'
  page?: number
  page_size?: number
}

// 获取付款记录列表
export function fetchPaymentList(params: PaymentListParams) {
  return request.get<PaymentListResponse>({
    url: '/api/customer/receipt/payment/list',
    params
  })
}
