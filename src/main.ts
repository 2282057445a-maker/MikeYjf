import { createApp } from 'vue'
import i18next from 'i18next'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

import { TUIComponents, TUIChatKit } from './TUIKit'
import { TUIStore, StoreName, TUITranslateService } from '@tencentcloud/chat-uikit-engine-lite'
import TUINotification from './TUIKit/components/TUINotification/index'
import { ElMessage } from 'element-plus'
import { locales } from './locales'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// ===== 全局错误处理 =====
app.config.errorHandler = (err, instance, info) => {
  console.error('[MikeChat] 全局错误:', err, info)
  ElMessage.error({ message: '应用出现异常，请刷新页面重试', duration: 4000 })
}

// ===== 全局属性：Toast 通知 =====
app.config.globalProperties.$toast = {
  success: (msg: string) => ElMessage.success({ message: msg, duration: 2500 }),
  error: (msg: string) => ElMessage.error({ message: msg, duration: 4000 }),
  warning: (msg: string) => ElMessage.warning({ message: msg, duration: 3000 }),
  info: (msg: string) => ElMessage.info({ message: msg, duration: 2000 }),
}

// 挂载
app.mount('#app')

// ===== 初始化 TUIKit =====
TUIChatKit.components(TUIComponents, app)
TUIChatKit.init()

TUITranslateService.setI18next(i18next)
TUITranslateService.provideLanguages(locales)
TUITranslateService.useI18n()

TUINotification.setNotificationConfiguration({
  showPreviews: true,
  allowNotifications: true,
  notificationTitle: 'MikeChat',
  notificationIcon: 'https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png',
})

TUIStore.watch(StoreName.CHAT, {
  newMessageList: (newMessageList: unknown) => {
    if (Array.isArray(newMessageList)) {
      newMessageList.forEach((message: any) => TUINotification.notify(message))
    }
  },
})

console.log('🎉 [MikeChat v5.1 Ultimate] 应用初始化完成')
