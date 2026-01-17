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
        <template #status="{ row }">
          <ElTag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>
        <template #receipt_status="{ row }">
          <ElTag :type="getReceiptStatusType(row.receipt_status)">
            {{ getReceiptStatusLabel(row.receipt_status) }}
          </ElTag>
        </template>
        <template #image_url="{ row }">
          <ElImage
            v-if="row.image_url"
            :src="row.image_url"
            :preview-src-list="[row.image_url]"
            fit="cover"
            preview-teleported
            style="width: 50px; height: 50px; cursor: pointer; border-radius: 4px"
            :hide-on-click-modal="true"
          />
        </template>
        <template #operation="{ row }">
          <template v-if="row.status === 'pending'">
            <ElButton type="success" size="small" @click="handleApprove(row)">通过</ElButton>
            <ElButton type="danger" size="small" @click="handleReject(row)">拒绝</ElButton>
          </template>
          <ElButton v-else type="info" size="small" @click="handleViewLogs(row)">
            查看审核历史
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="approveVisible" title="审核通过" width="400px">
      <ElForm ref="approveFormRef" :model="approveForm" :rules="approveRules" label-width="100px">
        <ElFormItem label="实际收款" prop="paid_amount">
          <ElInputNumber
            v-model="approveForm.paid_amount"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 200px"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="approveVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="approveLoading" @click="submitApprove"
          >确认通过</ElButton
        >
      </template>
    </ElDialog>

    <ElDialog v-model="rejectVisible" title="审核拒绝" width="400px">
      <ElForm ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-width="100px">
        <ElFormItem label="拒绝理由" prop="reason">
          <ElInput
            v-model="rejectForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝理由"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="rejectVisible = false">取消</ElButton>
        <ElButton type="danger" :loading="rejectLoading" @click="submitReject">确认拒绝</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="logsVisible" title="审核历史" width="600px">
      <ElTable :data="auditLogs" stripe border>
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
    </ElDialog>

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
          <ElDescriptionsItem label="备注" :span="2">
            {{ currentDetail?.remark || '-' }}
          </ElDescriptionsItem>
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
  import { ref } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetPaymentList,
    fetchApprovePayment,
    fetchRejectPayment,
    fetchAuditLogs
  } from '@/api/system-manage'
  import PaymentSearch from './modules/payment-search.vue'
  import {
    ElTag,
    ElImage,
    ElDescriptions,
    ElDescriptionsItem,
    ElEmpty,
    ElButton
  } from 'element-plus'

  defineOptions({ name: 'PaymentAudit' })

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

  const approveVisible = ref(false)
  const approveLoading = ref(false)
  const approveFormRef = ref<FormInstance>()
  const currentApproveRow = ref<PaymentListItem | null>(null)
  const approveForm = reactive({
    paid_amount: '' as string
  })

  const approveRules: FormRules = {
    paid_amount: [{ required: true, message: '请输入实际收款金额', trigger: 'blur' }]
  }

  const rejectVisible = ref(false)
  const rejectLoading = ref(false)
  const rejectFormRef = ref<FormInstance>()
  const currentRejectRow = ref<PaymentListItem | null>(null)
  const rejectForm = reactive({
    reason: ''
  })

  const rejectRules: FormRules = {
    reason: [{ required: true, message: '请输入拒绝理由', trigger: 'blur' }]
  }

  const logsVisible = ref(false)
  const auditLogs = ref<
    { id: number; status: string; operator_name: string; reason: string; created_at: string }[]
  >([])

  const detailVisible = ref(false)
  const currentDetail = ref<PaymentListItem | null>(null)

  const handleViewLogs = async (row: PaymentListItem) => {
    try {
      const res = await fetchAuditLogs({ payment_id: row.id })
      auditLogs.value = res.data
      logsVisible.value = true
    } catch (error) {
      console.error('获取审核历史失败:', error)
      ElMessage.error('获取审核历史失败')
    }
  }

  const handleApprove = (row: PaymentListItem) => {
    currentApproveRow.value = row
    approveForm.paid_amount = String(row.amount)
    approveVisible.value = true
  }

  const submitApprove = async () => {
    if (!currentApproveRow.value) return

    try {
      await approveFormRef.value?.validate()
    } catch {
      return
    }

    approveLoading.value = true
    try {
      await fetchApprovePayment(currentApproveRow.value.id, {
        paid_amount: approveForm.paid_amount
      })
      ElMessage.success('审核通过成功')
      approveVisible.value = false
      refreshData()
    } catch (error) {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    } finally {
      approveLoading.value = false
    }
  }

  const handleReject = (row: PaymentListItem) => {
    currentRejectRow.value = row
    rejectForm.reason = ''
    rejectVisible.value = true
  }

  const submitReject = async () => {
    if (!currentRejectRow.value) return

    try {
      await rejectFormRef.value?.validate()
    } catch {
      return
    }

    rejectLoading.value = true
    try {
      await fetchRejectPayment(currentRejectRow.value.id, {
        reason: rejectForm.reason
      })
      ElMessage.success('已拒绝')
      rejectVisible.value = false
      refreshData()
    } catch (error) {
      console.error('审核拒绝失败:', error)
      ElMessage.error('审核拒绝失败')
    } finally {
      rejectLoading.value = false
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
          useSlot: true,
          slotName: 'image_url'
        },
        {
          prop: 'status',
          label: '付款状态',
          width: 100,
          align: 'center',
          useSlot: true,
          slotName: 'status'
        },
        {
          prop: 'receipt_status',
          label: '批次状态',
          width: 100,
          align: 'center',
          useSlot: true,
          slotName: 'receipt_status'
        },
        { prop: 'remark', label: '备注', minWidth: 120, showOverflowTooltip: true },
        { prop: 'reject_reason', label: '拒绝理由', minWidth: 150, showOverflowTooltip: true },
        { prop: 'uploaded_at', label: '上传时间', width: 180, align: 'center' },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          align: 'center',
          fixed: 'right',
          useSlot: true,
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
