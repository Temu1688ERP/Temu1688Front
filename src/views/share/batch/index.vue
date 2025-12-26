<template>
  <PhoneVerify v-if="!isVerified" @verified="handleVerified" />
  <div v-else class="share-batch">
    <div class="batch-container">
      <h1 class="batch-title">批次预览</h1>
      <p class="batch-phone">当前手机号：{{ phone }}</p>
      <!-- 在这里添加批次预览内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import PhoneVerify from './components/PhoneVerify.vue'

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

<style scoped lang="scss">
  .share-batch {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100vw;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: #f5f7fa;
  }

  .batch-container {
    width: 100%;
    max-width: 1200px;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
  }

  .batch-title {
    margin-bottom: 16px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }

  .batch-phone {
    font-size: 14px;
    color: #909399;
  }
</style>
