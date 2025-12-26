<template>
  <div class="phone-verify">
    <div class="verify-card">
      <div class="verify-header">
        <div class="verify-icon">
          <ElIcon :size="32"><Iphone /></ElIcon>
        </div>
        <h2 class="verify-title">供货商批次查询</h2>
        <p class="verify-desc">请输入您的手机号以查看批次信息</p>
      </div>
      <ElForm ref="formRef" :model="formData" :rules="rules" @submit.prevent="handleSubmit">
        <ElFormItem prop="phone">
          <ElInput
            v-model="formData.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
            size="large"
            class="phone-input"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            查询批次
          </ElButton>
        </ElFormItem>
      </ElForm>
      <div class="verify-footer">
        <span>仅供货商可查看相关批次信息</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Iphone } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({
    name: 'PhoneVerify'
  })

  const emit = defineEmits<{
    verified: [phone: string]
  }>()

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const formData = reactive({
    phone: ''
  })

  const validatePhone = (_rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  const rules: FormRules = {
    phone: [{ validator: validatePhone, trigger: 'blur' }]
  }

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      emit('verified', formData.phone)
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .phone-verify {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .verify-card {
    width: 100%;
    max-width: 420px;
    padding: 48px 40px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgb(0 0 0 / 15%);
  }

  .verify-header {
    margin-bottom: 36px;
    text-align: center;
  }

  .verify-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
  }

  .verify-title {
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .verify-desc {
    font-size: 14px;
    line-height: 1.5;
    color: #6b7280;
  }

  .phone-input {
    :deep(.el-input__wrapper) {
      padding: 4px 16px;
      border-radius: 10px;
      box-shadow: 0 0 0 1px #e5e7eb;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 0 1px #667eea;
      }

      &.is-focus {
        box-shadow:
          0 0 0 2px rgb(102 126 234 / 20%),
          0 0 0 1px #667eea;
      }
    }

    :deep(.el-input__inner) {
      height: 48px;
      font-size: 16px;
      letter-spacing: 2px;

      &::placeholder {
        letter-spacing: 0;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 8px 20px rgb(102 126 234 / 40%);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .verify-footer {
    padding-top: 20px;
    margin-top: 24px;
    text-align: center;
    border-top: 1px solid #f3f4f6;

    span {
      font-size: 12px;
      color: #9ca3af;
    }
  }
</style>
