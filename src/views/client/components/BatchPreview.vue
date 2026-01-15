<template>
  <div class="batch-preview">
    <ElCard class="batch-card" shadow="never">
      <template #header>
        <div class="batch-header">
          <h2 class="batch-title">批次预览</h2>
          <span class="batch-phone">当前手机号：{{ phone }}</span>
        </div>
      </template>

      <ElTable :data="tableData" v-loading="loading" stripe border>
        <ElTableColumn prop="id" label="批次ID" width="100" align="center" />
        <ElTableColumn prop="created_at" label="创建时间" min-width="180" align="center" />
        <ElTableColumn prop="goods_total" label="商品总数" width="100" align="center" />
        <ElTableColumn label="总金额" width="120" align="right">
          <template #default="{ row }"> ¥{{ row.total_price }} </template>
        </ElTableColumn>
        <ElTableColumn label="已收金额" width="120" align="right">
          <template #default="{ row }"> ¥{{ row.received_price }} </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" link @click="handleView(row)">查看</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="batch-pagination">
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

    <!-- 详情抽屉 -->
    <ElDrawer v-model="drawerVisible" title="批次详情" size="80%">
      <ElTable :data="detailData" v-loading="detailLoading" stripe border>
        <ElTableColumn label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="goods-info">
              <ElImage
                :src="row.goods.sku_image || row.goods.goods_image"
                :preview-src-list="[row.goods.sku_image || row.goods.goods_image]"
                fit="cover"
                class="goods-image"
              />
              <div class="goods-content">
                <ElTooltip :content="row.goods.goods_title" placement="top" :show-after="300">
                  <div class="goods-title">{{ row.goods.goods_title }}</div>
                </ElTooltip>
                <div class="goods-meta">
                  <span>{{ row.goods.goods_cat }}</span>
                  <span class="divider">|</span>
                  <span class="goods-price">¥{{ row.goods.price }}</span>
                </div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="ID信息" width="180">
          <template #default="{ row }">
            <div class="id-info">
              <div>商品：{{ row.goods.goods_id }}</div>
              <div>产品：{{ row.goods.product_id }}</div>
              <div>SKC：{{ row.goods.skc_id }}</div>
              <div>SKU：{{ row.goods.sku_id }}</div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="SKU规格" width="150">
          <template #default="{ row }">
            <div class="sku-spec">
              <div v-for="(value, key) in row.goods.sku_spec_list" :key="key">
                {{ key }}：{{ value }}
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="num" label="采购数量" width="100" align="center" />
        <ElTableColumn label="应付金额" width="100" align="right">
          <template #default="{ row }"> ¥{{ row.price }} </template>
        </ElTableColumn>
        <ElTableColumn label="已付金额" width="100" align="right">
          <template #default="{ row }"> ¥{{ row.received }} </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 上传付款单 -->
      <div class="upload-section">
        <h3 class="upload-title">上传付款单</h3>
        <ElForm ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
          <ElFormItem label="付款金额" prop="amount">
            <ElInputNumber
              v-model="uploadForm.amount"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入付款金额"
              style="width: 200px"
            />
          </ElFormItem>
          <ElFormItem label="付款凭证" prop="images">
            <ElUpload
              v-model:file-list="uploadForm.images"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              accept="image/*"
            >
              <ElIcon><Plus /></ElIcon>
              <template #tip>
                <div class="upload-tip">支持 jpg、png 格式</div>
              </template>
            </ElUpload>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :loading="uploadLoading" @click="handleUpload">
              提交付款单
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import {
    ElTooltip,
    ElMessage,
    type FormInstance,
    type FormRules,
    type UploadUserFile
  } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import {
    fetchCustomerReceiptList,
    fetchCustomerReceiptDetail,
    type CustomerReceipt,
    type ReceiptDetailItem
  } from '@/api/customer'

  defineOptions({
    name: 'BatchPreview'
  })

  defineProps<{
    phone: string
  }>()

  // 状态映射
  const STATUS_MAP: Record<
    string,
    { label: string; type: 'warning' | 'info' | 'danger' | 'success' }
  > = {
    pending: { label: '待付款', type: 'warning' },
    'pending-purchase': { label: '待采购', type: 'info' },
    closed: { label: '已关闭', type: 'danger' },
    shipping: { label: '发货中', type: 'success' }
  }

  const getStatusLabel = (status: string) => STATUS_MAP[status]?.label || status
  const getStatusType = (status: string) => STATUS_MAP[status]?.type || 'info'

  // 表格数据
  const loading = ref(false)
  const tableData = ref<CustomerReceipt[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 抽屉
  const drawerVisible = ref(false)
  const detailLoading = ref(false)
  const detailData = ref<ReceiptDetailItem[]>([])
  const currentReceiptId = ref<number>()

  // 上传表单
  const uploadFormRef = ref<FormInstance>()
  const uploadLoading = ref(false)
  const uploadForm = reactive({
    amount: undefined as number | undefined,
    images: [] as UploadUserFile[]
  })

  const uploadRules: FormRules = {
    amount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
    images: [{ required: true, message: '请上传付款凭证', trigger: 'change' }]
  }

  // 获取数据
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await fetchCustomerReceiptList()
      tableData.value = res.data
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  // 分页处理
  const handleSizeChange = () => {
    pagination.current = 1
    fetchData()
  }

  const handleCurrentChange = () => {
    fetchData()
  }

  // 查看详情
  const handleView = async (row: CustomerReceipt) => {
    currentReceiptId.value = row.id
    drawerVisible.value = true
    detailLoading.value = true
    // 重置上传表单
    uploadForm.amount = undefined
    uploadForm.images = []
    try {
      const res = await fetchCustomerReceiptDetail(row.id)
      detailData.value = res.data
    } finally {
      detailLoading.value = false
    }
  }

  // 提交付款单
  const handleUpload = async () => {
    const valid = await uploadFormRef.value?.validate().catch(() => false)
    if (!valid) return

    uploadLoading.value = true
    try {
      // TODO: 调用上传付款单接口
      console.log('提交付款单', {
        receipt_id: currentReceiptId.value,
        amount: uploadForm.amount,
        images: uploadForm.images
      })
      ElMessage.success('付款单提交成功')
      drawerVisible.value = false
      fetchData()
    } finally {
      uploadLoading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .batch-preview {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100vw;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: #f5f7fa;
  }

  .batch-card {
    width: 100%;
    max-width: 1200px;
  }

  .batch-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .batch-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .batch-phone {
    font-size: 14px;
    color: #909399;
  }

  .batch-pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .goods-info {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .goods-image {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 6px;
  }

  .goods-content {
    flex: 1;
    overflow: hidden;
  }

  .goods-title {
    display: -webkit-box;
    overflow: hidden;
    font-weight: 500;
    line-height: 1.4;
    text-overflow: ellipsis;
    cursor: pointer;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .goods-meta {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;

    .divider {
      margin: 0 8px;
    }

    .goods-price {
      color: #f56c6c;
    }
  }

  .id-info {
    font-size: 12px;
    line-height: 1.6;
    color: #606266;
  }

  .sku-spec {
    font-size: 12px;
    line-height: 1.6;
    color: #909399;
  }

  .upload-section {
    padding: 24px 0;
    margin-top: 24px;
    border-top: 1px solid #ebeef5;
  }

  .upload-title {
    margin: 0 0 20px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
</style>
