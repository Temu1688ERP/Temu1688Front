<template>
  <el-dialog v-model="visible" title="批次详情" width="800px" destroy-on-close @close="handleClose">
    <el-descriptions :column="2" border v-if="detail">
      <el-descriptions-item label="批次ID">{{ detail.receipt.id }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{
        detail.receipt.customer_name
      }}</el-descriptions-item>
      <el-descriptions-item label="总金额">¥{{ detail.receipt.total_amount }}</el-descriptions-item>
      <el-descriptions-item label="已付金额"
        >¥{{ detail.receipt.paid_amount }}</el-descriptions-item
      >
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(detail.receipt.status)">{{
          getStatusLabel(detail.receipt.status)
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.receipt.created_at }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{
        detail.receipt.remark || '-'
      }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">商品明细</el-divider>
    <el-table :data="detail?.goods || []" border stripe>
      <el-table-column prop="id" label="明细ID" width="80" />
      <el-table-column prop="goods_name" label="商品名称" min-width="150" />
      <el-table-column prop="price" label="单价" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column label="小计" width="120">
        <template #default="{ row }">¥{{ (Number(row.price) * row.quantity).toFixed(2) }}</template>
      </el-table-column>
    </el-table>

    <el-divider content-position="left" v-if="detail?.receipt?.payments?.length"
      >付款记录</el-divider
    >
    <el-table
      :data="detail?.receipt?.payments || []"
      border
      stripe
      v-if="detail?.receipt?.payments?.length"
    >
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

  interface DetailResponse {
    receipt: {
      id: number
      customer_id: number
      customer_name: string
      total_amount: string
      paid_amount: string
      status: string
      remark: string
      created_at: string
      payments: Array<{
        id: number
        amount: string
        status: string
        remark: string
        created_at: string
      }>
    }
    goods: Array<{
      id: number
      goods_id: number
      goods_name: string
      price: string
      quantity: number
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

  const detail = ref<DetailResponse | null>(null)
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
