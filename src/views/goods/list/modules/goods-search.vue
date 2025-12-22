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
  import { fetchGetTemuList } from '@/api/system-manage'

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

  // 账号列表
  const accountOptions = ref<{ label: string; value: number }[]>([])

  // 获取账号列表
  const getAccountList = async () => {
    try {
      const res = await fetchGetTemuList({})
      accountOptions.value = (res || []).map((item) => ({
        label: item.username,
        value: item.id
      }))
    } catch (error) {
      console.error('获取账号列表失败:', error)
    }
  }

  // 初始化获取账号列表
  onMounted(() => {
    getAccountList()
  })

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '账号',
      key: 'account_id',
      type: 'select',
      placeholder: '请选择账号',
      clearable: true,
      options: accountOptions.value
    },
    {
      label: '关键词',
      key: 'keywords',
      type: 'input',
      placeholder: '请输入商品ID/SKU/名称等关键词',
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
