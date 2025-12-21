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
      label: '商品ID',
      key: 'id',
      type: 'input',
      placeholder: '请输入商品ID',
      clearable: true
    },
    {
      label: 'SKCID',
      key: 'skcId',
      type: 'input',
      placeholder: '请输入SKCID',
      clearable: true
    },
    {
      label: 'SKUID',
      key: 'skuId',
      type: 'input',
      placeholder: '请输入SKUID',
      clearable: true
    },
    {
      label: '商品名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入商品名称',
      clearable: true
    },
    {
      label: '类型',
      key: 'type',
      type: 'input',
      placeholder: '请输入类型',
      clearable: true
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '在售', value: 'on_sale' },
        { label: '下架', value: 'off_sale' },
        { label: '缺货', value: 'out_of_stock' }
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
