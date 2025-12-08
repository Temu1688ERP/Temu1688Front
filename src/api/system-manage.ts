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
