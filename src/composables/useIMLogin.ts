// src/composables/useIMLogin.ts
import { ref, computed } from 'vue'
import { TUIChatEngine } from '@tencentcloud/chat-uikit-engine-lite'
import { SDKAppID, secretKey } from '../config/im'
import { genTestUserSig } from '../TUIKit/debug/GenerateTestUserSig'

// 全局单例状态
const isLoggedIn = ref(false)
const isLoggingIn = ref(false)
const loginError = ref('')
const currentUserID = ref('')

export function useIMLogin() {
  /**
   * 登录 IM
   */
  async function login(userID: string) {
    // 防止重复登录
    if (isLoggedIn.value || isLoggingIn.value) {
      console.warn('⚠️ IM 已登录或正在登录，跳过')
      return
    }

    isLoggingIn.value = true
    loginError.value = ''
    currentUserID.value = userID

    try {
      const { userSig } = genTestUserSig({ SDKAppID, secretKey, userID })
      
      console.log('🔄 [IM Login] 开始登录...', { SDKAppID, userID })
      
      await TUIChatEngine.login({ SDKAppID, userID, userSig })
      
      isLoggedIn.value = true
      console.log('✅ [IM Login] 登录成功！', { userID })
    } catch (error: any) {
      loginError.value = error.message || '登录失败'
      console.error('❌ [IM Login] 登录失败:', error)
      throw error
    } finally {
      isLoggingIn.value = false
    }
  }

  /**
   * 登出 IM
   */
  async function logout() {
    if (!isLoggedIn.value) {
      console.log('⚠️ [IM Logout] 未登录，无需登出')
      return
    }

    try {
      await TUIChatEngine.logout()
      isLoggedIn.value = false
      currentUserID.value = ''
      loginError.value = ''
      console.log('✅ [IM Logout] 登出成功')
    } catch (error) {
      console.error('❌ [IM Logout] 登出失败:', error)
    }
  }

  /**
   * 获取 UserSig（供组件使用）
   */
  function getUserSig(userID: string) {
    const { userSig } = genTestUserSig({ SDKAppID, secretKey, userID })
    return userSig
  }

  return {
    // 状态
    isLoggedIn: computed(() => isLoggedIn.value),
    isLoggingIn: computed(() => isLoggingIn.value),
    loginError: computed(() => loginError.value),
    currentUserID: computed(() => currentUserID.value),
    
    // 方法
    login,
    logout,
    getUserSig,
    SDKAppID,
  }
}
