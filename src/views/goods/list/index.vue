<template>
  <div class="goods-list-page art-full-height">
    <!-- 搜索栏 -->
    <GoodsSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></GoodsSearch>

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
  import { fetchGetGoodsList } from '@/api/goods'
  import GoodsSearch from './modules/goods-search.vue'
  import { ElImage, ElTag } from 'element-plus'

  defineOptions({ name: 'GoodsList' })

  type GoodsListItem = Api.Goods.GoodsListItem
  type GoodsStatus = Api.Goods.GoodsStatus

  // 状态映射
  const statusMap: Record<GoodsStatus, { label: string; type: 'success' | 'danger' | 'warning' }> =
    {
      on_sale: { label: '在售', type: 'success' },
      off_sale: { label: '下架', type: 'danger' },
      out_of_stock: { label: '缺货', type: 'warning' }
    }

  // 搜索表单
  const searchForm = ref({
    sku: undefined,
    spu: undefined,
    name: undefined,
    category: undefined,
    brand: undefined,
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
      apiFn: fetchGetGoodsList,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'sku', label: 'SKU', width: 120 },
        { prop: 'spu', label: 'SPU', width: 120 },
        { prop: 'name', label: '商品名称', minWidth: 200 },
        {
          prop: 'image',
          label: '商品图片',
          width: 100,
          formatter: (row: GoodsListItem) =>
            h(ElImage, {
              src: row.image,
              style: { width: '60px', height: '60px' },
              fit: 'cover',
              previewSrcList: [row.image],
              lazy: true
            })
        },
        {
          prop: 'price',
          label: '价格',
          width: 100,
          formatter: (row: GoodsListItem) => `¥${row.price.toFixed(2)}`
        },
        { prop: 'stock', label: '库存', width: 80 },
        { prop: 'category', label: '分类', width: 100 },
        { prop: 'brand', label: '品牌', width: 100 },
        { prop: 'spec', label: '规格', width: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row: GoodsListItem) => {
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
