/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      nickname: string
      username: string
      roles?: string[]
      buttons?: string[]
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = UserListItem[]

    /** 用户列表项 */
    interface UserListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      username: string
      password: string
      Nickname: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<Pick<UserListItem, 'id' | 'username'>>

    /** 用户表单参数 */
    interface UserFormParams {
      id?: number
      username: string
      password: string
    }

    /** 角色列表 */
    type RoleList = RoleListItem[]

    /** 权限项 */
    interface PermissionItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      name: string
      path: string
    }

    /** 角色列表项 */
    interface RoleListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      name: string
      permissions: PermissionItem[]
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<Pick<RoleListItem, 'id' | 'name'>>

    /** 角色表单参数 */
    interface RoleFormParams {
      id?: number
      name: string
      permissions: number[]
    }

    /** TEMU列表 */
    type TemuList = TemuListItem[]

    /** TEMU状态 */
    type TemuStatus = 'waiting' | 'processing' | 'normal' | 'offline' | 'exception' | 'unknown'

    /** TEMU类型 */
    type TemuType = 'self' | 'agent'

    /** TEMU列表项 */
    interface TemuListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      username: string
      password: string
      status: TemuStatus
      type: TemuType
      principal: string
      shop_name: string
      reason?: any
    }

    /** TEMU搜索参数 */
    type TemuSearchParams = Partial<Pick<TemuListItem, 'id' | 'username' | 'status'>>

    /** TEMU表单参数 */
    interface TemuFormParams {
      id?: number
      username: string
      password: string
      type: TemuType
      principal: string
      status?: TemuStatus
    }

    /** 付款记录状态 */
    type PaymentStatus = 'pending' | 'approved' | 'rejected'

    /** 付款记录列表项 */
    interface PaymentListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      receipt_id: number
      amount: string
      image_url: string
      status: PaymentStatus
      remark: string
      rejected_reason: string
      audit_logs: AuditLogItem[]
    }

    /** 审核日志项 */
    interface AuditLogItem {
      id: number
      payment_id: number
      status: PaymentStatus
      operator_id: number
      operator_name: string
      reason: string
      created_at: string
    }

    /** 付款记录列表响应 */
    type PaymentListResponse = {
      total: number
      data: PaymentListItem[]
    }

    /** 付款记录搜索参数 */
    type PaymentSearchParams = {
      id?: number
      receipt_id?: number
      status?: PaymentStatus
      page?: number
      page_size?: number
    }

    /** 审核通过请求 */
    interface ApprovePaymentParams {
      paid_amount: string
    }

    /** 审核拒绝请求 */
    interface RejectPaymentParams {
      reason: string
    }
  }

  /** 商品管理类型 */
  namespace Goods {
    /** 商品列表 */
    type GoodsList = GoodsListItem[]

    /** SKU规格 */
    interface SkuSpecList {
      [key: string]: string
    }

    /** 商品属性 */
    interface GoodsProperties {
      [key: string]: string
    }

    /** 商品关联账号 */
    interface GoodsAccount {
      username: string
    }

    /** 商品列表项 */
    interface GoodsListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      account_id: number
      account?: GoodsAccount
      goods_title: string
      goods_id: string
      product_id: string
      skc_id: string
      sku_id: string
      goods_image: string
      goods_cat: string
      sku_image: string
      sku_spec_list: SkuSpecList
      properties: GoodsProperties
      categories: string[]
      price: string
      search: string
    }

    /** 商品搜索参数 */
    type GoodsSearchParams = Partial<{
      keywords: string
      account_id: number
      page: string
      page_size: string
    }>
  }

  /** 订单管理类型 */
  namespace Order {
    /** 订单列表 */
    type OrderList = OrderListItem[]

    /** 订单状态 */
    type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

    /** 订单列表项 */
    interface OrderListItem {
      id: number
      created_at: string
      updated_at: string
      deleted_at: string | null
      order_no: string
      sku: string
      goods_name: string
      quantity: number
      unit_price: number
      total_amount: number
      buyer: string
      address: string
      logistics: string
      status: OrderStatus
    }

    /** 订单搜索参数 */
    type OrderSearchParams = Partial<
      Pick<OrderListItem, 'order_no' | 'sku' | 'goods_name' | 'buyer' | 'status'>
    >
  }
}
