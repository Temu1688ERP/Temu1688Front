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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import OrderSearch from './modules/order-search.vue'
  import { ElButton } from 'element-plus'

  defineOptions({ name: 'StockList' })

  // 批次数据（mock）
  interface Batch {
    id: number
    account_id: number
    name: string
    total_count: number
    prepared_count: number
    created_at: string
    updated_at: string
  }

  // mock 账号选项
  const accountOptions = ref([
    { label: '账号1', value: 1 },
    { label: '账号2', value: 2 },
    { label: '账号3', value: 3 }
  ])

  // 搜索表单
  const searchForm = ref({
    account_id: undefined
  })

  // mock 批次数据
  const allBatches: Batch[] = [
    {
      id: 1,
      account_id: 1,
      name: '批次1',
      total_count: 100,
      prepared_count: 80,
      created_at: '2024-12-20 10:30:00',
      updated_at: '2024-12-20 15:30:00'
    },
    {
      id: 2,
      account_id: 1,
      name: '批次2',
      total_count: 50,
      prepared_count: 50,
      created_at: '2024-12-19 14:20:00',
      updated_at: '2024-12-19 18:20:00'
    },
    {
      id: 3,
      account_id: 1,
      name: '批次3',
      total_count: 200,
      prepared_count: 120,
      created_at: '2024-12-18 09:15:00',
      updated_at: '2024-12-18 16:15:00'
    },
    {
      id: 4,
      account_id: 2,
      name: '批次1',
      total_count: 80,
      prepared_count: 60,
      created_at: '2024-12-21 11:00:00',
      updated_at: '2024-12-21 14:00:00'
    },
    {
      id: 5,
      account_id: 2,
      name: '批次2',
      total_count: 150,
      prepared_count: 150,
      created_at: '2024-12-20 16:45:00',
      updated_at: '2024-12-20 20:45:00'
    },
    {
      id: 6,
      account_id: 3,
      name: '批次1',
      total_count: 30,
      prepared_count: 10,
      created_at: '2024-12-22 08:30:00',
      updated_at: '2024-12-22 09:30:00'
    }
  ]

  // Mock API 函数
  const fetchBatchList = async (params: Record<string, any>) => {
    // 模拟 API 返回
    let filteredBatches = allBatches
    if (params.account_id) {
      filteredBatches = allBatches.filter((batch) => batch.account_id === params.account_id)
    }
    return {
      data: {
        list: filteredBatches,
        total: filteredBatches.length
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
        { prop: 'name', label: '批次', minWidth: 150 },
        { prop: 'total_count', label: '备货总数', width: 100 },
        { prop: 'prepared_count', label: '已备货数', width: 100 },
        { prop: 'updated_at', label: '更新时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: Batch) =>
            h('div', { style: { display: 'flex', gap: '8px' } }, [
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  onClick: () => handleView(row)
                },
                () => '查看'
              ),
              h(
                ElButton,
                {
                  type: 'success',
                  link: true,
                  onClick: () => handleComplete(row)
                },
                () => '完成'
              )
            ])
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
    console.log('查看批次:', batch)
    // TODO: 跳转到批次详情页
  }

  // 完成批次
  const handleComplete = (batch: Batch) => {
    console.log('完成批次:', batch)
    // TODO: 完成批次操作
  }
</script>
