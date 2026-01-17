<template>
  <el-dialog v-model="visible" title="批次详情" width="800px" destroy-on-close @close="handleClose">
    <el-descriptions :column="2" border v-if="detail">
      <el-descriptions-item label="批次ID">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="批次号">{{ detail.batch_no }}</el-descriptions-item>
      <el-descriptions-item label="商家名称">{{
        detail.account?.shop_name || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(detail.status)">{{ getStatusLabel(detail.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="商品总数">{{ detail.goods_total }}</el-descriptions-item>
      <el-descriptions-item label="数量">{{ detail.num }}</el-descriptions-item>
      <el-descriptions-item label="总金额">¥{{ detail.total_price }}</el-descriptions-item>
      <el-descriptions-item label="已收金额">¥{{ detail.received_price }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.created_at }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail.updated_at }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left" v-if="detail?.details?.length">商品明细</el-divider>
    <el-table :data="detail?.details || []" border stripe v-if="detail?.details?.length">
      <el-table-column prop="id" label="明细ID" width="80" />
      <el-table-column prop="goods_id" label="商品ID" width="100" />
      <el-table-column prop="price" label="单价" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="num" label="数量" width="80" />
      <el-table-column prop="received" label="已收" width="100">
        <template #default="{ row }">¥{{ row.received }}</template>
      </el-table-column>
    </el-table>

    <el-divider content-position="left" v-if="detail?.payments?.length">付款记录</el-divider>
    <el-table :data="detail?.payments || []" border stripe v-if="detail?.payments?.length">
      <el-table-column prop="id" label="付款ID" width="80" />
      <el-table-column prop="amount" label="付款金额" width="100">
        <template #default="{ row }">¥{{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getPaymentStatusType(row.status)">{{
            getPaymentStatusLabel(row.status)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" />
      <el-table-column prop="created_at" label="创建时间" width="180" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
  import { fetchGetReceiptDetail } from '@/api/system-manage'

  interface ReceiptDetailItem {
    id: number
    created_at: string
    updated_at: string
    account_id: number
    batch_no: string
    status: string
    goods_total: number
    total_price: string
    received_price: string
    num: number
    account?: {
      id: number
      shop_name: string
    }
    payments?: Array<{
      id: number
      amount: string
      status: string
      remark: string
      created_at: string
    }>
    details?: Array<{
      id: number
      goods_id: number
      price: string
      num: number
      received: string
    }>
  }

  const props = defineProps<{
    modelValue: boolean
    receiptId: number | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const detail = ref<ReceiptDetailItem | null>(null)
  const loading = ref(false)

  const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      pending: 'warning',
      paid: 'success',
      cancelled: 'info'
    }
    return map[status] || 'info'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待付款',
      paid: '已付款',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const getPaymentStatusType = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    }
    return map[status] || 'info'
  }

  const getPaymentStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回'
    }
    return map[status] || status
  }

  const loadDetail = async () => {
    if (!props.receiptId) return
    loading.value = true
    try {
      detail.value = await fetchGetReceiptDetail(props.receiptId)
    } catch (error) {
      console.error('获取详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    detail.value = null
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.receiptId) {
        loadDetail()
      }
    }
  )
</script>
