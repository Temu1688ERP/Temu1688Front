<template>
  <div class="order-list-page art-full-height">
    <!-- 搜索栏 -->
    <OrderSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></OrderSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetOrderList } from '@/api/order'
  import OrderSearch from './modules/order-search.vue'
  import { ElTag } from 'element-plus'

  defineOptions({ name: 'OrderList' })

  type OrderListItem = Api.Order.OrderListItem
  type OrderStatus = Api.Order.OrderStatus

  // 状态映射
  const statusMap: Record<
    OrderStatus,
    { label: string; type: 'success' | 'danger' | 'warning' | 'info' | 'primary' }
  > = {
    pending: { label: '待付款', type: 'warning' },
    paid: { label: '已付款', type: 'primary' },
    shipped: { label: '已发货', type: 'info' },
    delivered: { label: '已签收', type: 'success' },
    cancelled: { label: '已取消', type: 'danger' }
  }

  // 搜索表单
  const searchForm = ref({
    order_no: undefined,
    sku: undefined,
    goods_name: undefined,
    buyer: undefined,
    status: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetOrderList,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'order_no', label: '订单号', width: 180 },
        { prop: 'sku', label: 'SKU', width: 120 },
        { prop: 'goods_name', label: '商品名称', minWidth: 180 },
        { prop: 'quantity', label: '数量', width: 80 },
        {
          prop: 'unit_price',
          label: '单价',
          width: 100,
          formatter: (row: OrderListItem) => `¥${row.unit_price.toFixed(2)}`
        },
        {
          prop: 'total_amount',
          label: '总额',
          width: 100,
          formatter: (row: OrderListItem) => `¥${row.total_amount.toFixed(2)}`
        },
        { prop: 'buyer', label: '买家', width: 120 },
        { prop: 'address', label: '收货地址', minWidth: 200 },
        { prop: 'logistics', label: '物流', width: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: OrderListItem) => {
            const status = statusMap[row.status] || { label: '未知', type: 'info' as const }
            return h(ElTag, { type: status.type }, () => status.label)
          }
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }
</script>
