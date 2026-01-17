<template>
  <div class="payment-list-page art-full-height">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <ElForm :model="searchForm" label-width="100px" inline>
        <ElFormItem label="批次ID">
          <ElInputNumber v-model="searchForm.receipt_id" :min="0" placeholder="请输入批次ID" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="待审核" value="pending" />
            <ElOption label="已审核" value="approved" />
            <ElOption label="已拒绝" value="rejected" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
          <ElButton @click="resetSearch">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </div>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格 -->
      <ElTable :data="data" v-loading="loading" stripe border>
        <ElTableColumn prop="id" label="记录ID" width="80" align="center" />
        <ElTableColumn prop="receipt_id" label="批次ID" width="100" align="center" />
        <ElTableColumn prop="amount" label="付款金额" width="120" align="right">
          <template #default="{ row }"> ¥{{ row.amount }} </template>
        </ElTableColumn>
        <ElTableColumn label="付款凭证" width="100" align="center">
          <template #default="{ row }">
            <ElImage
              v-if="row.image_url"
              :src="row.image_url"
              :preview-src-list="[row.image_url]"
              fit="cover"
              style="width: 50px; height: 50px; cursor: pointer; border-radius: 4px"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <ElTableColumn
          prop="rejected_reason"
          label="拒绝理由"
          min-width="150"
          show-overflow-tooltip
        />
        <ElTableColumn prop="created_at" label="创建时间" width="180" align="center" />
        <ElTableColumn label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <ElButton type="success" size="small" @click="handleApprove(row)">通过</ElButton>
              <ElButton type="danger" size="small" @click="handleReject(row)">拒绝</ElButton>
            </template>
            <ElButton v-else type="info" size="small" @click="handleViewLogs(row)">
              查看审核历史
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="table-pagination">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 审核通过对话框 -->
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

    <!-- 审核拒绝对话框 -->
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

    <!-- 审核历史对话框 -->
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
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchGetPaymentList,
    fetchApprovePayment,
    fetchRejectPayment,
    fetchAuditLogs
  } from '@/api/system-manage'

  defineOptions({ name: 'PaymentList' })

  type PaymentListItem = Api.SystemManage.PaymentListItem
  type AuditLogItem = Api.SystemManage.AuditLogItem

  // 状态映射
  type StatusConfig = {
    label: string
    type: 'warning' | 'success' | 'danger' | 'info'
  }

  const STATUS_MAP: Record<string, StatusConfig> = {
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' }
  }

  const getStatusLabel = (status: string) => STATUS_MAP[status]?.label || status
  const getStatusType = (status: string) => STATUS_MAP[status]?.type || 'info'

  const getLogStatusLabel = (status: string) => STATUS_MAP[status]?.label || status
  const getLogStatusType = (status: string) => STATUS_MAP[status]?.type || 'info'

  // 搜索表单
  const searchForm = reactive({
    receipt_id: undefined as number | undefined,
    status: '' as string
  })

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表格数据
  const loading = ref(false)
  const data = ref<PaymentListItem[]>([])

  // 审核通过
  const approveVisible = ref(false)
  const approveLoading = ref(false)
  const approveFormRef = ref<FormInstance>()
  const currentApproveRow = ref<PaymentListItem | null>(null)
  const approveForm = reactive({
    paid_amount: ''
  })

  const approveRules: FormRules = {
    paid_amount: [{ required: true, message: '请输入实际收款金额', trigger: 'blur' }]
  }

  // 审核拒绝
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

  // 审核历史
  const logsVisible = ref(false)
  const auditLogs = ref<AuditLogItem[]>([])

  // 获取数据
  const getData = async () => {
    loading.value = true
    try {
      const res = await fetchGetPaymentList({
        receipt_id: searchForm.receipt_id,
        status: (searchForm.status as PaymentListItem['status']) || undefined,
        page: pagination.current,
        page_size: pagination.size
      })
      data.value = res.data
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.current = 1
    getData()
  }

  // 重置
  const resetSearch = () => {
    searchForm.receipt_id = undefined
    searchForm.status = ''
    pagination.current = 1
    getData()
  }

  // 分页
  const handleSizeChange = () => {
    pagination.current = 1
    getData()
  }

  const handleCurrentChange = () => {
    getData()
  }

  // 审核通过
  const handleApprove = (row: PaymentListItem) => {
    currentApproveRow.value = row
    approveForm.paid_amount = row.amount
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
      getData()
    } catch (error) {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    } finally {
      approveLoading.value = false
    }
  }

  // 审核拒绝
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
      getData()
    } catch (error) {
      console.error('审核拒绝失败:', error)
      ElMessage.error('审核拒绝失败')
    } finally {
      rejectLoading.value = false
    }
  }

  // 查看审核历史
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

  onMounted(() => {
    getData()
  })
</script>

<style scoped lang="scss">
  .payment-list-page {
    padding: 20px;
  }

  .search-bar {
    padding: 20px;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 4px;
  }

  .table-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
</style>
