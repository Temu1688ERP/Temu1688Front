<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '订单号',
      key: 'order_no',
      type: 'input',
      placeholder: '请输入订单号',
      clearable: true
    },
    {
      label: 'SKU',
      key: 'sku',
      type: 'input',
      placeholder: '请输入SKU',
      clearable: true
    },
    {
      label: '商品名称',
      key: 'goods_name',
      type: 'input',
      placeholder: '请输入商品名称',
      clearable: true
    },
    {
      label: '买家',
      key: 'buyer',
      type: 'input',
      placeholder: '请输入买家',
      clearable: true
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '待付款', value: 'pending' },
        { label: '已付款', value: 'paid' },
        { label: '已发货', value: 'shipped' },
        { label: '已签收', value: 'delivered' },
        { label: '已取消', value: 'cancelled' }
      ]
    }
  ])

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
