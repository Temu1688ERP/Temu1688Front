<template>
  <PhoneVerify v-if="!isVerified" @verified="handleVerified" />
  <BatchPreview v-else :phone="phone" />
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import PhoneVerify from './components/PhoneVerify.vue'
  import BatchPreview from './components/BatchPreview.vue'

  defineOptions({
    name: 'ShareBatch'
  })

  const isVerified = ref(false)
  const phone = ref('')
  let wasDark = false

  // 强制使用亮色模式
  onMounted(() => {
    wasDark = document.documentElement.classList.contains('dark')
    if (wasDark) {
      document.documentElement.classList.remove('dark')
    }
  })

  // 离开页面时恢复原来的模式
  onUnmounted(() => {
    if (wasDark) {
      document.documentElement.classList.add('dark')
    }
  })

  const handleVerified = (phoneNumber: string) => {
    phone.value = phoneNumber
    isVerified.value = true
  }
</script>
