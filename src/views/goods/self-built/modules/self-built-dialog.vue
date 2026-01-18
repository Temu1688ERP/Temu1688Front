<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增商品' : '编辑商品'"
    width="500px"
    align-center
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="商品名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入商品名称" maxlength="100" />
      </ElFormItem>
      <ElFormItem label="商品图片" prop="image">
        <ElUpload
          class="goods-image-uploader"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/*"
          :on-change="handleImageChange"
        >
          <ElImage v-if="imageUrl" :src="imageUrl" fit="cover" class="goods-image" />
          <ElIcon v-else class="goods-image-uploader-icon"><Plus /></ElIcon>
        </ElUpload>
      </ElFormItem>
      <ElFormItem label="成本价" prop="cost_price">
        <ElInput v-model="formData.cost_price" placeholder="请输入成本价">
          <template #prepend>¥</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="售价" prop="price">
        <ElInput v-model="formData.price" placeholder="请输入售价">
          <template #prepend>¥</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="商品详情" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入商品详情（选填）"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { fetchSelfGoodsDetail, saveSelfGoods } from '@/api/goods'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    goodsId?: number
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = reactive({
    id: undefined as number | undefined,
    name: '',
    description: '',
    cost_price: '',
    price: '',
    image_file: null as File | null
  })

  // 图片预览 URL
  const imageUrl = ref('')

  // 表单验证规则
  const rules = computed<FormRules>(() => ({
    name: [
      { required: true, message: '请输入商品名称', trigger: 'blur' },
      { max: 100, message: '商品名称不能超过100个字符', trigger: 'blur' }
    ],
    image: [
      {
        required: dialogType.value === 'add',
        validator: (_rule, _value, callback) => {
          if (dialogType.value === 'add' && !formData.image_file && !imageUrl.value) {
            callback(new Error('请上传商品图片'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ],
    cost_price: [
      { required: true, message: '请输入成本价', trigger: 'blur' },
      { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的价格格式', trigger: 'blur' }
    ],
    price: [
      { required: true, message: '请输入售价', trigger: 'blur' },
      { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的价格格式', trigger: 'blur' }
    ]
  }))

  // 处理图片选择
  const handleImageChange = (file: UploadFile) => {
    if (file.raw) {
      formData.image_file = file.raw
      imageUrl.value = URL.createObjectURL(file.raw)
    }
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(formData, {
      id: undefined,
      name: '',
      description: '',
      cost_price: '',
      price: '',
      image_file: null
    })
    imageUrl.value = ''
  }

  // 加载商品详情
  const loadGoodsDetail = async () => {
    if (!props.goodsId) return

    try {
      loading.value = true

      const data = await fetchSelfGoodsDetail(props.goodsId)
      Object.assign(formData, {
        id: data.id,
        name: data.name,
        description: data.description || '',
        cost_price: data.cost_price,
        price: data.price,
        image_file: null
      })
      imageUrl.value = data.image_url || ''
    } catch (error) {
      console.error('获取商品详情失败:', error)
      ElMessage.error('获取商品详情失败')
    } finally {
      loading.value = false
    }
  }

  // 监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.goodsId],
    async ([visible]) => {
      if (visible) {
        resetForm()
        if (props.type === 'edit' && props.goodsId) {
          await loadGoodsDetail()
        }
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          loading.value = true

          const submitData = new FormData()
          if (formData.id) {
            submitData.append('id', String(formData.id))
          }
          submitData.append('name', formData.name)
          submitData.append('cost_price', formData.cost_price)
          submitData.append('price', formData.price)
          if (formData.description) {
            submitData.append('description', formData.description)
          }
          if (formData.image_file) {
            submitData.append('image_file', formData.image_file)
          }

          await saveSelfGoods(submitData)
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
          dialogVisible.value = false
          emit('success')
        } catch (error) {
          console.error('提交失败:', error)
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>

<style scoped lang="scss">
  .goods-image-uploader {
    :deep(.el-upload) {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .goods-image-uploader-icon {
    width: 120px;
    height: 120px;
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }

  .goods-image {
    display: block;
    width: 120px;
    height: 120px;
  }
</style>
