<template>
  <div class="self-built-page art-full-height">
    <!-- 搜索栏 -->
    <SelfBuiltSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></SelfBuiltSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton v-ripple @click="handleAdd"> 新增商品 </ElButton>
        </template>
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

    <!-- 新增/编辑对话框 -->
    <SelfBuiltDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :goods-id="editingGoodsId"
      @success="refreshData"
    />

    <!-- 分配/取消分配对话框 -->
    <AssignDialog
      v-model:visible="assignDialogVisible"
      :type="assignDialogType"
      :goods="assigningGoods"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import SelfBuiltSearch from './modules/self-built-search.vue'
  import SelfBuiltDialog from './modules/self-built-dialog.vue'
  import AssignDialog from './modules/assign-dialog.vue'
  import { ElImage, ElButton, ElMessage, ElMessageBox } from 'element-plus'
  import { fetchSelfGoodsList, deleteSelfGoods } from '@/api/goods'

  defineOptions({ name: 'GoodsSelfBuilt' })

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    temu_account_id: undefined
  })

  // 格式化商品信息
  const formatGoodsInfo = (row: Api.SelfGoods.SelfGoodsItem) => {
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
      h(ElImage, {
        src: row.image_url,
        style: { width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px' },
        fit: 'cover',
        previewSrcList: [row.image_url],
        previewTeleported: true
      }),
      h('div', { style: { flex: 1, overflow: 'hidden' } }, [
        h(
          'div',
          {
            style: {
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          },
          row.name
        ),
        row.description
          ? h(
              'div',
              {
                style: { color: '#909399', fontSize: '12px', marginTop: '4px' }
              },
              row.description
            )
          : null
      ])
    ])
  }

  // 格式化价格信息
  const formatPriceInfo = (row: Api.SelfGoods.SelfGoodsItem) => {
    return h('div', [
      h('div', { style: { color: '#f56c6c', fontWeight: 500 } }, `¥${row.price}`),
      h(
        'div',
        { style: { color: '#909399', fontSize: '12px', marginTop: '2px' } },
        `成本: ¥${row.cost_price}`
      )
    ])
  }

  // 格式化已分配账号信息
  const formatAssignedAccounts = (row: Api.SelfGoods.SelfGoodsItem) => {
    console.log('row.temu_accounts:', row.temu_accounts)
    if (!row.temu_accounts || row.temu_accounts.length === 0) {
      return h('span', { style: { color: '#909399' } }, '-')
    }

    const names = row.temu_accounts.map((a) => a.shop_name || a.phone).join(', ')
    return h('span', { style: { color: '#67c23a' } }, names)
  }

  // 操作按钮
  const formatActions = (row: Api.SelfGoods.SelfGoodsItem) => {
    return h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(ElButton, { type: 'primary', link: true, onClick: () => handleAssign(row) }, () => '分配'),
      h(
        ElButton,
        { type: 'warning', link: true, onClick: () => handleUnassign(row) },
        () => '取消分配'
      ),
      h(ElButton, { type: 'primary', link: true, onClick: () => handleEdit(row) }, () => '编辑'),
      h(ElButton, { type: 'danger', link: true, onClick: () => handleDelete(row) }, () => '删除')
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
    core: {
      apiFn: fetchSelfGoodsList,
      apiParams: {
        ...searchForm.value
      },
      paginationKey: {
        current: 'page',
        size: 'page_size'
      },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', width: 80 },
        {
          prop: 'goods_info',
          label: '商品信息',
          minWidth: 280,
          formatter: (row: Api.SelfGoods.SelfGoodsItem) => formatGoodsInfo(row)
        },
        {
          prop: 'price',
          label: '价格',
          width: 140,
          formatter: (row: Api.SelfGoods.SelfGoodsItem) => formatPriceInfo(row)
        },
        {
          prop: 'temu_accounts',
          label: '已分配账号',
          minWidth: 200,
          formatter: (row: Api.SelfGoods.SelfGoodsItem) => formatAssignedAccounts(row)
        },
        { prop: 'created_at', label: '创建时间', width: 180 },
        { prop: 'updated_at', label: '更新时间', width: 180 },
        {
          prop: 'actions',
          label: '操作',
          width: 240,
          fixed: 'right',
          formatter: (row: Api.SelfGoods.SelfGoodsItem) => formatActions(row)
        }
      ]
    }
  })

  // 搜索
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  // 对话框状态
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const editingGoodsId = ref<number>()

  // 分配对话框状态
  const assignDialogVisible = ref(false)
  const assignDialogType = ref<'assign' | 'unassign'>('assign')
  const assigningGoods = ref<Api.SelfGoods.SelfGoodsItem>({} as Api.SelfGoods.SelfGoodsItem)

  // 新增
  const handleAdd = () => {
    dialogType.value = 'add'
    editingGoodsId.value = undefined
    dialogVisible.value = true
  }

  // 编辑
  const handleEdit = (row: Api.SelfGoods.SelfGoodsItem) => {
    dialogType.value = 'edit'
    editingGoodsId.value = row.id
    dialogVisible.value = true
  }

  // 分配
  const handleAssign = (row: Api.SelfGoods.SelfGoodsItem) => {
    assignDialogType.value = 'assign'
    assigningGoods.value = row
    assignDialogVisible.value = true
  }

  // 取消分配
  const handleUnassign = (row: Api.SelfGoods.SelfGoodsItem) => {
    assignDialogType.value = 'unassign'
    assigningGoods.value = row
    assignDialogVisible.value = true
  }

  // 删除
  const handleDelete = async (row: Api.SelfGoods.SelfGoodsItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？`, '提示', {
        type: 'warning'
      })
      await deleteSelfGoods(row.id)
      ElMessage.success('删除成功')
      await refreshData()
    } catch {
      // 取消删除
    }
  }
</script>

<style scoped lang="scss">
  .account-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .account-tag {
    display: inline-block;
    padding: 2px 8px;
    margin-right: 4px;
    margin-bottom: 4px;
    font-size: 12px;
    color: #67c23a;
    background-color: #f0f9eb;
    border-radius: 4px;
  }

  .account-more {
    margin-left: 4px;
    font-size: 12px;
    color: #909399;
  }
</style>
