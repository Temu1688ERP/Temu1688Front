<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'assign' ? '分配 Temu 账号' : '取消分配'"
    width="500px"
    align-center
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="商品名称">
        <ElInput :model-value="goods.name" disabled />
      </ElFormItem>
      <ElFormItem v-if="type === 'assign'" label="选择账号" prop="temu_account_ids">
        <ElSelect
          v-model="formData.temu_account_ids"
          multiple
          filterable
          placeholder="请选择 Temu 账号"
          style="width: 100%"
          :disabled="displayAccountList.length === 0"
        >
          <ElOption
            v-for="item in displayAccountList"
            :key="item.id"
            :label="item.shop_name || item.username"
            :value="item.id"
          />
        </ElSelect>
        <ElText
          v-if="displayAccountList.length === 0"
          type="info"
          size="small"
          style="margin-top: 8px"
        >
          所有账号已分配给该商品
        </ElText>
      </ElFormItem>
      <ElFormItem v-else label="已分配账号" prop="temu_account_ids">
        <ElSelect
          v-model="formData.temu_account_ids"
          multiple
          filterable
          placeholder="请选择要取消分配的账号"
          style="width: 100%"
          :disabled="assignedAccountList.length === 0"
        >
          <ElOption
            v-for="item in assignedAccountList"
            :key="item.id"
            :label="item.shop_name || item.username"
            :value="item.id"
          />
        </ElSelect>
        <ElText
          v-if="assignedAccountList.length === 0"
          type="info"
          size="small"
          style="margin-top: 8px"
        >
          该商品尚未分配任何账号
        </ElText>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="loading"
          :disabled="displayAccountList.length === 0"
          @click="handleSubmit"
        >
          确认
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { assignSelfGoods, unassignSelfGoods, fetchGetTemuList } from '@/api/goods'

  interface Props {
    visible: boolean
    type: 'assign' | 'unassign'
    goods: Api.SelfGoods.SelfGoodsItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const temuAccountList = ref<Api.SystemManage.TemuListItem[]>([])

  const assignedAccountList = computed(() => {
    if (!props.goods.temu_accounts || props.goods.temu_accounts.length === 0) {
      return [] as Api.SystemManage.TemuListItem[]
    }
    return props.goods.temu_accounts.map((item) => ({
      id: item.id,
      shop_name: item.shop_name,
      username: item.phone
    })) as Api.SystemManage.TemuListItem[]
  })

  const unassignedAccountList = computed(() => {
    const assignedIds = assignedAccountList.value.map((item) => item.id)
    return temuAccountList.value.filter((item) => !assignedIds.includes(item.id))
  })

  const displayAccountList = computed(() => {
    if (props.type === 'unassign') {
      return assignedAccountList.value
    }
    return unassignedAccountList.value
  })

  const formData = reactive({
    self_goods_id: 0,
    temu_account_ids: [] as number[]
  })

  const rules: FormRules = {
    temu_account_ids: [
      {
        required: true,
        validator: (_rule, _value, callback) => {
          if (formData.temu_account_ids.length === 0) {
            callback(new Error('请选择账号'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }

  const loadTemuAccounts = async () => {
    try {
      const res = await fetchGetTemuList({ page: 1, page_size: 1000 })
      temuAccountList.value = res || []
    } catch (error) {
      console.error('获取 Temu 账号列表失败:', error)
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        formData.self_goods_id = props.goods.id
        formData.temu_account_ids = []
        nextTick(() => {
          formRef.value?.clearValidate()
        })
        loadTemuAccounts()
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          loading.value = true
          const temu_account_ids = formData.temu_account_ids.join(',')

          if (props.type === 'assign') {
            await assignSelfGoods({
              self_goods_id: props.goods.id,
              temu_account_ids
            })
            ElMessage.success('分配成功')
          } else {
            await unassignSelfGoods({
              self_goods_id: props.goods.id,
              temu_account_ids
            })
            ElMessage.success('取消分配成功')
          }

          dialogVisible.value = false
          emit('success')
        } catch (error) {
          console.error('操作失败:', error)
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>
