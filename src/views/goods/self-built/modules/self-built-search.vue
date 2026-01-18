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

  // 状态选项
  const statusOptions = [
    { label: '在售', value: 'on_sale' },
    { label: '下架', value: 'off_sale' },
    { label: '草稿', value: 'draft' }
  ]

  // 分类选项 (Mock)
  const categoryOptions = [
    { label: '服装', value: '服装' },
    { label: '数码', value: '数码' },
    { label: '母婴', value: '母婴' },
    { label: '家居', value: '家居' },
    { label: '食品', value: '食品' }
  ]

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '状态',
      key: 'status',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      options: statusOptions
    },
    {
      label: '分类',
      key: 'category',
      type: 'select',
      placeholder: '请选择分类',
      clearable: true,
      options: categoryOptions
    },
    {
      label: '关键词',
      key: 'keywords',
      type: 'input',
      placeholder: '请输入商品名称/SKU编码',
      clearable: true
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
