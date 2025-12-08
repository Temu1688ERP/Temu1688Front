<!-- 用户菜单 -->
<template>
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    :width="240"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="false"
    popper-class="user-menu-popover"
    popper-style="padding: 5px 16px;"
  >
    <template #reference>
      <ElAvatar class="mr-5 c-p max-sm:mr-[16px]" :size="34" style="background-color: #409eff">
        {{ userInfo.username?.charAt(0)?.toUpperCase() }}
      </ElAvatar>
    </template>
    <template #default>
      <li class="pt-3">
        <div class="flex-c pb-1 px-0">
          <ElAvatar class="mr-3 ml-0 float-left" :size="40" style="background-color: #409eff">
            {{ userInfo.username?.charAt(0)?.toUpperCase() }}
          </ElAvatar>
          <div class="w-[calc(100%-60px)] h-full">
            <span class="block text-sm font-medium text-g-800 truncate">{{
              userInfo.username
            }}</span>
            <span class="block mt-0.5 text-xs text-g-500 truncate">{{ userInfo.nickname }}</span>
          </div>
        </div>
        <ul class="py-4 mt-3 border-t border-g-300/80">
          <li class="btn-item" @click="goPage('/system/user-center')">
            <ArtSvgIcon icon="ri:user-3-line" />
            <span>个人中心</span>
          </li>
          <li class="btn-item" @click="lockScreen()">
            <ArtSvgIcon icon="ri:lock-line" />
            <span>锁定屏幕</span>
          </li>
          <li class="w-full h-px my-2 bg-g-300/80"></li>
          <li class="log-out c-p" @click="loginOut"> 退出登录 </li>
        </ul>
      </li>
    </template>
  </ElPopover>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { mittBus } from '@/utils/sys'

  defineOptions({ name: 'ArtUserMenu' })

  const router = useRouter()
  const userStore = useUserStore()

  const { getUserInfo: userInfo } = storeToRefs(userStore)
  const userMenuPopover = ref()

  /**
   * 页面跳转
   * @param {string} path - 目标路径
   */
  const goPage = (path: string): void => {
    router.push(path)
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm('您是否要退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply py-1.5
    mt-5
    text-xs
    text-center
    border
    border-g-400
    rounded-md
    transition-all
    duration-200
    hover:shadow-xl;
  }
</style>
