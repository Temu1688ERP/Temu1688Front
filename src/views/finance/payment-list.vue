<template>
  <div class="payment-list-page art-full-height">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <ElForm :model="searchForm" label-width="100px" inline>
        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable>
            <ElOption label="待审核" value="pending" />
            <ElOption label="已通过" value="approved" />
            <ElOption label="已拒绝" value="rejected" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="日期范围">
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
          <ElButton @click="resetSearch">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </div>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格 -->
      <ElTable :data="data" v-loading="loading" stripe border @row-click="handleRowClick">
        <ElTableColumn prop="id" label="记录ID" width="80" align="center" />
        <ElTableColumn prop="batch_no" label="批次号" width="140" align="center" />
        <ElTableColumn prop="receipt_date" label="批次日期" width="110" align="center" />
        <ElTableColumn prop="uploader_name" label="商家名称" width="120" />
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
              :hide-on-click-modal="true"
              @click.stop
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="付款状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="receipt_status" label="批次状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getReceiptStatusType(row.receipt_status)">
              {{ getReceiptStatusLabel(row.receipt_status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <ElTableColumn
          prop="reject_reason"
          label="拒绝理由"
          min-width="150"
          show-overflow-tooltip
        />
        <ElTableColumn prop="uploaded_at" label="上传时间" width="180" align="center" />
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

    <!-- 付款记录详情对话框 -->
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
  import { ref, reactive, onMounted } from 'vue'
  import { fetchGetPaymentList, fetchAuditLogs } from '@/api/system-manage'

  defineOptions({ name: 'FinancePaymentList' })

  type PaymentListItem = Api.SystemManage.PaymentListItem
  type PaymentStatus = Api.SystemManage.PaymentStatus

  // 付款状态映射
  const STATUS_MAP: Record<
    string,
    { label: string; type: 'warning' | 'success' | 'danger' | 'info' }
  > = {
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已拒绝', type: 'danger' }
  }

  // 批次状态映射
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

  // 搜索表单
  const searchForm = reactive({
    status: '',
    start_date: '',
    end_date: ''
  })

  const dateRange = ref<[string, string] | null>(null)

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 表格数据
  const loading = ref(false)
  const data = ref<PaymentListItem[]>([])

  // 详情弹窗
  const detailVisible = ref(false)
  const currentDetail = ref<PaymentListItem | null>(null)
  const auditLogs = ref<
    { id: number; status: string; operator_name: string; reason: string; created_at: string }[]
  >([])

  // 日期范围变化
  const handleDateChange = (val: [string, string] | null) => {
    if (val) {
      searchForm.start_date = val[0]
      searchForm.end_date = val[1]
    } else {
      searchForm.start_date = ''
      searchForm.end_date = ''
    }
  }

  // 获取数据
  const getData = async () => {
    loading.value = true
    try {
      const res = await fetchGetPaymentList({
        status: (searchForm.status as PaymentStatus) || undefined,
        start_date: searchForm.start_date || undefined,
        end_date: searchForm.end_date || undefined,
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
    searchForm.status = ''
    searchForm.start_date = ''
    searchForm.end_date = ''
    dateRange.value = null
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

  // 点击行查看详情
  const handleRowClick = async (row: PaymentListItem) => {
    currentDetail.value = row
    detailVisible.value = true

    // 获取审核历史
    try {
      const res = await fetchAuditLogs({ payment_id: row.id })
      auditLogs.value = res.data
    } catch (error) {
      console.error('获取审核历史失败:', error)
      auditLogs.value = []
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

  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      padding-left: 8px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      border-left: 3px solid #409eff;
    }
  }

  :deep(.el-table) {
    th.el-table__cell {
      border-right: 1px solid #ebeef5;
    }

    td.el-table__cell {
      border-right: 1px solid #ebeef5;
    }

    td.el-table__cell:last-child {
      border-right: none;
    }

    th.el-table__cell:last-child {
      border-right: none;
    }
  }

  :deep(.el-image__preview) {
    z-index: 9999 !important;
  }

  :deep(.el-image__wrapper) {
    z-index: auto;
  }
</style>
