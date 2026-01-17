<template>
  <div class="payment-list-page art-full-height">
    <PaymentSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></PaymentSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #operation="{ row }">
          <ElButton type="primary" link @click="handleViewDetail(row)">查看</ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="detailVisible" title="付款记录详情" width="800px">
      <div class="detail-section">
        <h4 class="section-title">基本信息</h4>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="记录ID">{{ currentDetail?.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="批次号">{{ currentDetail?.batch_no }}</ElDescriptionsItem>
          <ElDescriptionsItem label="批次日期">{{
            currentDetail?.receipt_date
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="批次状态">
            <ElTag :type="getReceiptStatusType(currentDetail?.receipt_status)">
              {{ getReceiptStatusLabel(currentDetail?.receipt_status) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="商家名称">{{
            currentDetail?.uploader_name
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="商家ID">{{ currentDetail?.uploader_id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="付款金额">¥{{ currentDetail?.amount }}</ElDescriptionsItem>
          <ElDescriptionsItem label="付款状态">
            <ElTag :type="getStatusType(currentDetail?.status)">
              {{ getStatusLabel(currentDetail?.status) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="备注" :span="2">{{
            currentDetail?.remark || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="上传时间">{{ currentDetail?.uploaded_at }}</ElDescriptionsItem>
          <ElDescriptionsItem label="拒绝理由">{{
            currentDetail?.reject_reason || '-'
          }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <div class="detail-section">
        <h4 class="section-title">付款凭证</h4>
        <ElImage
          v-if="currentDetail?.image_url"
          :src="currentDetail.image_url"
          :preview-src-list="[currentDetail.image_url]"
          fit="contain"
          preview-teleported
          style="width: 200px; height: 200px; cursor: pointer; border-radius: 4px"
          :hide-on-click-modal="true"
        />
        <span v-else>-</span>
      </div>

      <div class="detail-section">
        <h4 class="section-title">审核历史</h4>
        <ElTable :data="auditLogs" stripe border max-height="300">
          <ElTableColumn prop="id" label="ID" width="80" align="center" />
          <ElTableColumn prop="status" label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="getLogStatusType(row.status)">
                {{ getLogStatusLabel(row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="operator_name" label="操作人" width="100" align="center" />
          <ElTableColumn prop="reason" label="理由" min-width="150" />
          <ElTableColumn prop="created_at" label="操作时间" width="180" align="center" />
        </ElTable>
        <ElEmpty v-if="auditLogs.length === 0" description="暂无审核记录" :image-size="80" />
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, h } from 'vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetPaymentList, fetchAuditLogs } from '@/api/system-manage'
  import PaymentSearch from './modules/payment-search.vue'
  import {
    ElTag,
    ElImage,
    ElDescriptions,
    ElDescriptionsItem,
    ElEmpty,
    ElButton
  } from 'element-plus'

  defineOptions({ name: 'FinancePaymentList' })

  type PaymentListItem = Api.SystemManage.PaymentListItem

  const STATUS_MAP: Record<
    string,
    { label: string; type: 'warning' | 'success' | 'danger' | 'info' }
  > = {
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' }
  }

  const RECEIPT_STATUS_MAP: Record<
    string,
    { label: string; type: 'success' | 'warning' | 'danger' | 'info' }
  > = {
    pending: { label: '待付款', type: 'warning' },
    pending_purchase: { label: '待采购', type: 'info' },
    paid: { label: '已付款', type: 'success' },
    closed: { label: '已关闭', type: 'danger' },
    shipping: { label: '发货中', type: 'info' }
  }

  const getStatusLabel = (status?: string) => STATUS_MAP[status || '']?.label || status || ''
  const getStatusType = (status?: string) => STATUS_MAP[status || '']?.type || 'info'
  const getReceiptStatusLabel = (status?: string) =>
    RECEIPT_STATUS_MAP[status || '']?.label || status || ''
  const getReceiptStatusType = (status?: string) => RECEIPT_STATUS_MAP[status || '']?.type || 'info'
  const getLogStatusLabel = (status?: string) => STATUS_MAP[status || '']?.label || status || ''
  const getLogStatusType = (status?: string) => STATUS_MAP[status || '']?.type || 'info'

  const searchForm = ref({
    status: undefined as string | undefined,
    dateRange: undefined as [string, string] | undefined
  })

  const detailVisible = ref(false)
  const currentDetail = ref<PaymentListItem | null>(null)
  const auditLogs = ref<
    { id: number; status: string; operator_name: string; reason: string; created_at: string }[]
  >([])

  const handleViewDetail = async (row: PaymentListItem) => {
    currentDetail.value = row
    detailVisible.value = true

    try {
      const res = await fetchAuditLogs({ payment_id: row.id })
      auditLogs.value = res.data
    } catch (error) {
      console.error('获取审核历史失败:', error)
      auditLogs.value = []
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
      apiFn: fetchGetPaymentList,
      apiParams: {},
      columnsFactory: () => [
        { prop: 'id', label: '记录ID', width: 80, align: 'center' },
        { prop: 'batch_no', label: '批次号', width: 140, align: 'center' },
        { prop: 'receipt_date', label: '批次日期', width: 110, align: 'center' },
        { prop: 'uploader_name', label: '商家名称', width: 120 },
        {
          prop: 'amount',
          label: '付款金额',
          width: 120,
          align: 'right',
          formatter: (row: PaymentListItem) => `¥${row.amount}`
        },
        {
          prop: 'image_url',
          label: '付款凭证',
          width: 100,
          align: 'center',
          formatter: (row: PaymentListItem) =>
            row.image_url
              ? h(ElImage, {
                  src: row.image_url,
                  previewSrcList: [row.image_url],
                  fit: 'cover',
                  'preview-teleported': true,
                  style: { width: '50px', height: '50px', cursor: 'pointer', borderRadius: '4px' },
                  hideOnClickModal: true
                })
              : '-'
        },
        {
          prop: 'status',
          label: '付款状态',
          width: 100,
          align: 'center',
          formatter: (row: PaymentListItem) =>
            h(ElTag, { type: getStatusType(row.status) }, () => getStatusLabel(row.status))
        },
        {
          prop: 'receipt_status',
          label: '批次状态',
          width: 100,
          align: 'center',
          formatter: (row: PaymentListItem) =>
            h(ElTag, { type: getReceiptStatusType(row.receipt_status) }, () =>
              getReceiptStatusLabel(row.receipt_status)
            )
        },
        { prop: 'remark', label: '备注', minWidth: 120, showOverflowTooltip: true },
        { prop: 'reject_reason', label: '拒绝理由', minWidth: 150, showOverflowTooltip: true },
        { prop: 'uploaded_at', label: '上传时间', width: 180, align: 'center' },
        {
          prop: 'operation',
          label: '操作',
          width: 100,
          align: 'center',
          fixed: 'right',
          slotName: 'operation'
        }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    const searchParamsData = { ...params }
    if (searchParamsData.dateRange && Array.isArray(searchParamsData.dateRange)) {
      searchParamsData.start_date = searchParamsData.dateRange[0]
      searchParamsData.end_date = searchParamsData.dateRange[1]
      delete searchParamsData.dateRange
    }
    Object.assign(searchParams, searchParamsData)
    getData()
  }
</script>
