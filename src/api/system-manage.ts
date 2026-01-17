import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/users',
    params
  })
}

// 创建用户
export function fetchCreateUser(data: Api.SystemManage.UserFormParams) {
  return request.post({
    url: '/api/users',
    data
  })
}

// 更新用户
export function fetchUpdateUser(data: Api.SystemManage.UserFormParams) {
  return request.post({
    url: '/api/users',
    data
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del({
    url: '/api/users',
    data: { id }
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/roles',
    params
  })
}

// 创建角色
export function fetchCreateRole(data: Api.SystemManage.RoleFormParams) {
  return request.post({
    url: '/api/roles',
    data
  })
}

// 更新角色
export function fetchUpdateRole(data: Api.SystemManage.RoleFormParams) {
  return request.post({
    url: '/api/roles',
    data
  })
}

// 删除角色
export function fetchDeleteRole(id: number) {
  return request.del({
    url: '/api/roles',
    data: { id }
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}

// 获取TEMU列表
export function fetchGetTemuList(params: Api.SystemManage.TemuSearchParams) {
  return request.get<Api.SystemManage.TemuList>({
    url: '/api/temu/accounts',
    params
  })
}

// 创建TEMU
export function fetchCreateTemu(data: Api.SystemManage.TemuFormParams) {
  return request.post({
    url: '/api/temu/accounts',
    data
  })
}

// 更新TEMU
export function fetchUpdateTemu(data: Api.SystemManage.TemuFormParams) {
  return request.post({
    url: '/api/temu/accounts',
    data
  })
}

// 删除TEMU
export function fetchDeleteTemu(id: number) {
  return request.del({
    url: '/api/temu/accounts',
    data: { id }
  })
}

// 获取付款记录列表
export function fetchGetPaymentList(params: Api.SystemManage.PaymentSearchParams) {
  return request.get<Api.SystemManage.PaymentListResponse>({
    url: '/api/payment',
    params
  })
}

// 审核通过
export function fetchApprovePayment(id: number, data: Api.SystemManage.ApprovePaymentParams) {
  return request.post({
    url: `/api/receipt/${id}/approve`,
    data
  })
}

// 审核拒绝
export function fetchRejectPayment(id: number, data: Api.SystemManage.RejectPaymentParams) {
  return request.post({
    url: `/api/receipt/${id}/reject`,
    data
  })
}

// 获取审核历史
export function fetchAuditLogs(params: { payment_id?: number; receipt_id?: number }) {
  return request.get<Api.SystemManage.AuditLogItem[]>({
    url: '/api/receipt/audit_logs',
    params
  })
}
