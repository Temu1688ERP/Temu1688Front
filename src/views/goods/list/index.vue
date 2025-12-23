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
  import { ElImage, ElTooltip } from 'element-plus'

  defineOptions({ name: 'GoodsList' })

  type GoodsListItem = Api.Goods.GoodsListItem

  // 搜索表单
  const searchForm = ref({
    keywords: undefined,
    account_id: undefined
  })

  // 格式化键值对列表（一行一个）
  const formatKeyValueList = (obj: Record<string, string>) => {
    const entries = Object.entries(obj)
    if (entries.length === 0) return ''
    return entries.map(([key, value]) => h('div', `${key}：${value}`))
  }

  // 格式化分类列表（顿号分隔）
  const formatCategories = (categories: string[]) => {
    return categories.join('、')
  }

  // 格式化ID信息（一行一个）
  const formatIdInfo = (row: GoodsListItem) => {
    return [
      h('div', `商品：${row.goods_id}`),
      h('div', `产品：${row.product_id}`),
      h('div', `SKC：${row.skc_id}`),
      h('div', `SKU：${row.sku_id}`)
    ]
  }

  // 格式化商品信息（图片+名称+分类+价格）
  const formatGoodsInfo = (row: GoodsListItem) => {
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
      // 图片
      h(ElImage, {
        src: row.goods_image,
        style: { width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px' },
        fit: 'cover',
        previewSrcList: [row.goods_image],
        previewTeleported: true,
        referrerpolicy: 'no-referrer'
      }),
      // 文字信息
      h('div', { style: { flex: 1, overflow: 'hidden' } }, [
        h(
          ElTooltip,
          {
            content: row.goods_title,
            placement: 'top',
            showAfter: 300
          },
          () =>
            h(
              'div',
              {
                style: {
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }
              },
              row.goods_title
            )
        ),
        h(
          'div',
          {
            style: { color: '#909399', fontSize: '12px', marginTop: '4px' }
          },
          [
            h('span', row.goods_cat),
            h('span', { style: { margin: '0 8px' } }, '|'),
            h('span', { style: { color: '#f56c6c' } }, `¥${row.price}`)
          ]
        )
      ])
    ])
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
    // 核心配置
    core: {
      apiFn: fetchGetGoodsList,
      apiParams: {
        ...searchForm.value
      },
      paginationKey: {
        current: 'page',
        size: 'page_size'
      },
      columnsFactory: () => [
        // ========== 基础信息（合并） ==========
        { prop: 'id', label: 'ID', width: 80 },
        {
          prop: 'goods_info',
          label: '商品信息',
          minWidth: 300,
          formatter: (row: GoodsListItem) => formatGoodsInfo(row)
        },

        // ========== ID标识（合并） ==========
        {
          prop: 'ids',
          label: 'ID信息',
          width: 200,
          formatter: (row: GoodsListItem) => formatIdInfo(row)
        },

        // ========== 规格属性 ==========
        {
          prop: 'sku_spec_list',
          label: 'SKU规格',
          width: 150,
          formatter: (row: GoodsListItem) => formatKeyValueList(row.sku_spec_list)
        },
        {
          prop: 'properties',
          label: '商品属性',
          width: 200,
          formatter: (row: GoodsListItem) => formatKeyValueList(row.properties)
        },

        // ========== 分类路径 ==========
        {
          prop: 'categories',
          label: '分类路径',
          minWidth: 250,
          formatter: (row: GoodsListItem) => formatCategories(row.categories),
          showOverflowTooltip: true
        },
        {
          prop: 'account',
          label: '账号',
          width: 120,
          formatter: (row: GoodsListItem) => row.account?.username || '-'
        },

        // ========== 时间 ==========
        { prop: 'updated_at', label: '更新时间', width: 160 }
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
