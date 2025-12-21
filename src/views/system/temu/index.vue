<template>
  <div class="temu-page art-full-height">
    <!-- 搜索栏 -->
    <TemuSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></TemuSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增TEMU</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- TEMU弹窗 -->
      <TemuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :temu-data="currentTemuData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetTemuList, fetchDeleteTemu } from '@/api/system-manage'
  import TemuSearch from './modules/temu-search.vue'
  import TemuDialog from './modules/temu-dialog.vue'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'Temu' })

  type TemuListItem = Api.SystemManage.TemuListItem
  type TemuStatus = Api.SystemManage.TemuStatus
  type TemuType = Api.SystemManage.TemuType

  // 类型映射
  const typeMap: Record<TemuType, { label: string; type: 'primary' | 'success' }> = {
    self: { label: '自营', type: 'primary' },
    agent: { label: '代运营', type: 'success' }
  }

  // 状态映射
  const statusMap: Record<
    TemuStatus,
    { label: string; type: 'success' | 'danger' | 'warning' | 'info' }
  > = {
    waiting: { label: '待验证', type: 'warning' },
    processing: { label: '验证中', type: 'warning' },
    normal: { label: '正常', type: 'success' },
    offline: { label: '已离线', type: 'warning' },
    exception: { label: '异常', type: 'danger' },
    unknown: { label: '未知', type: 'info' }
  }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentTemuData = ref<Partial<TemuListItem>>({})

  // 选中行
  const selectedRows = ref<TemuListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    username: undefined
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
      apiFn: fetchGetTemuList,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'username', label: '用户名' },
        {
          prop: 'type',
          label: '类型',
          width: 100,
          formatter: (row: TemuListItem) => {
            const typeInfo = typeMap[row.type] || { label: '未知', type: 'info' }
            return h(ElTag, { type: typeInfo.type }, () => typeInfo.label)
          }
        },
        { prop: 'principal', label: '主体名称', minWidth: 120 },
        { prop: 'shop_name', label: '店铺名称', minWidth: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row: TemuListItem) => {
            const status = statusMap[row.status] || statusMap.unknown
            return h(ElTag, { type: status.type }, () => status.label)
          }
        },
        {
          prop: 'reason',
          label: '异常原因',
          minWidth: 160,
          formatter: (row: TemuListItem) =>
            row.status === 'exception' ? row.reason?.String || '-' : '-'
        },
        { prop: 'created_at', label: '创建时间', sortable: true },
        { prop: 'updated_at', label: '更新时间', sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: TemuListItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteTemu(row)
              })
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
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示TEMU弹窗
   */
  const showDialog = (type: DialogType, row?: TemuListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentTemuData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除TEMU
   */
  const deleteTemu = (row: TemuListItem): void => {
    ElMessageBox.confirm(`确定要删除 "${row.username}" 吗？`, '删除TEMU', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteTemu(row.id)
        ElMessage.success('删除成功')
        getData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTemuData.value = {}
    // 刷新列表数据
    getData()
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: TemuListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
