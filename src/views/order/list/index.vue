<template>
  <div class="stock-list-page art-full-height">
    <!-- 搜索栏 -->
    <OrderSearch
      v-model="searchForm"
      :account-options="accountOptions"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></OrderSearch>

    <!-- 批次列表 -->
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

    <!-- 批次详情弹窗 -->
    <ReceiptDetail v-model="detailVisible" :receipt-id="currentReceiptId" />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import OrderSearch from './modules/order-search.vue'
  import ReceiptDetail from './modules/receipt-detail.vue'
  import { ElButton, ElTag } from 'element-plus'
  import { fetchGetReceiptList } from '@/api/system-manage'
  import { fetchGetTemuList } from '@/api/system-manage'

  defineOptions({ name: 'StockList' })

  // 批次数据接口
  interface Batch {
    id: number
    account_id: number
    batch_no: string
    status: string
    goods_total: number
    total_price: string
    received_price: string
    num: number
    created_at: string
    account?: {
      shop_name: string
    }
  }

  // 账号选项
  const accountOptions = ref<Array<{ label: string; value: number }>>([])

  // 详情弹窗
  const detailVisible = ref(false)
  const currentReceiptId = ref<number | null>(null)

  // 加载账号选项
  const loadAccountOptions = async () => {
    try {
      const res = await fetchGetTemuList({})
      accountOptions.value = res.map((item: any) => ({
        label: item.name || item.username,
        value: item.id
      }))
    } catch (error) {
      console.error('加载账号选项失败:', error)
    }
  }

  loadAccountOptions()

  // 搜索表单
  const searchForm = ref({
    account_id: undefined as number | undefined,
    status: undefined as string | undefined
  })

  // API 函数
  const fetchBatchList = async (params: Record<string, any>) => {
    const res = await fetchGetReceiptList({
      page: params.page,
      page_size: params.pageSize,
      customer_id: params.account_id,
      status: params.status
    })
    return {
      data: {
        list: res.data,
        total: res.total
      }
    }
  }

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
    core: {
      apiFn: fetchBatchList,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', minWidth: 50 },
        { prop: 'batch_no', label: '批次号', minWidth: 120 },
        { prop: 'account.shop_name', label: '商家名称', minWidth: 150 },
        { prop: 'total_price', label: '总金额', width: 100 },
        { prop: 'received_price', label: '已收金额', width: 100 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: Batch) => {
            const statusMap: Record<
              string,
              { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }
            > = {
              pending: { label: '待付款', type: 'warning' },
              paid: { label: '已付款', type: 'success' },
              cancelled: { label: '已取消', type: 'info' }
            }
            const status = statusMap[row.status] || { label: row.status, type: 'info' }
            return h(ElTag, { type: status.type }, () => status.label)
          }
        },
        { prop: 'created_at', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: Batch) =>
            h(
              ElButton,
              {
                type: 'primary',
                link: true,
                onClick: () => handleView(row)
              },
              () => '查看'
            )
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  // 查看批次详情
  const handleView = (batch: Batch) => {
    currentReceiptId.value = batch.id
    detailVisible.value = true
  }
</script>
