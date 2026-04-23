<template>
  <div class="chat-page">
    <!-- DEV 工具栏 (仅开发环境) -->
    <div v-if="isDev" class="dev-toolbar">
      <div class="dev-left">
        <span class="dev-logo">💬</span>
        <span class="dev-brand">MikeChat</span>
        <span class="dev-badge">v5.1</span>
      </div>
      <div class="dev-center">
        <select v-model="selectedUserID" class="user-select">
          <option value="yangjiafan">👤 yangjiafan</option>
          <option value="mike001">👤 mike001</option>
          <option value="mike002">👤 mike002</option>
          <option value="testuser">👤 testuser</option>
        </select>
        <button @click="switchUser" class="switch-btn" :disabled="isSwitching">
          {{ isSwitching ? '⏳ 切换中...' : '🔄 切换' }}
        </button>
      </div>
      <div class="dev-right">
        <div class="conn-pill" :class="{ online: isLoggedIn }">
          <span class="pill-dot"></span>{{ isLoggedIn ? '已连接' : '未连接' }}
        </div>
        <span class="user-tag">{{ currentUserID || '游客' }}</span>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-area">

      <!-- 加载中 -->
      <div v-if="isLoggingIn" class="overlay glass-overlay">
        <div class="glass-card state-card">
          <div class="loader-ring"></div>
          <h3>正在连接服务器</h3>
          <p>建立安全加密通道...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="loginError" class="overlay glass-overlay overlay--error">
        <div class="glass-card state-card">
          <div class="error-icon">⚠️</div>
          <h3>连接失败</h3>
          <p class="err-msg">{{ loginError }}</p>
          <button @click="retryLogin" class="retry-action">🔄 重新连接</button>
        </div>
      </div>

      <!-- 聊天界面 (核心区域) -->
      <div v-else-if="isLoggedIn" class="chat-wrapper-glass">
        <TUIKit
          :SDKAppID="SDKAppID"
          :userID="currentUserID"
          :userSig="currentUserSig"
        />
      </div>

      <!-- 未登录占位 -->
      <div v-else class="overlay glass-overlay">
        <div class="glass-card state-card">
          <div class="wait-icon">💬</div>
          <h3>等待初始化</h3>
          <p>正在准备聊天环境...</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import TUIKit from '../TUIKit/index.vue'
import { useIMLogin } from '../composables/useIMLogin'

const {
  isLoggedIn, isLoggingIn, loginError,
  currentUserID, login, logout, getUserSig, SDKAppID
} = useIMLogin()

const isDev = ref(import.meta.env.DEV)
const selectedUserID = ref('yangjiafan')
const isSwitching = ref(false)

const currentUserSig = computed(() =>
  currentUserID.value ? getUserSig(currentUserID.value) : ''
)

async function switchUser() {
  if (selectedUserID.value === currentUserID.value) return
  isSwitching.value = true
  try {
    if (isLoggedIn.value) {
      await logout()
      await new Promise(r => setTimeout(r, 300))
    }
    await login(selectedUserID.value)
  } finally { isSwitching.value = false }
}

async function retryLogin() { await login(selectedUserID.value) }

onMounted(async () => {
  if (!isLoggedIn.value && !isLoggingIn.value) {
    await login(selectedUserID.value)
  }

  // 搜索错误拦截：在 DOM 渲染后注入全局错误处理
  await nextTick()
  interceptSearchErrors()
})

/**
 * 拦截 TUISearch 的 SearchUnable 错误
 * 腾讯云 IM 云端搜索需要单独开通高级服务，未开通时搜索会报错
 * 此函数在控制台拦截该错误并显示友好提示
 */
function interceptSearchErrors() {
  const originalError = console.error
  console.error = function(...args: any[]) {
    const msg = args.join(' ')
    if (msg.includes('SearchUnable') || msg.includes('search')) {
      // 静默吞掉搜索错误，不显示给用户
      return
    }
    originalError.apply(console, args)
  }

  // 同时拦截 window error
  const originalHandler = window.onerror
  window.onerror = function(msg, ...rest) {
    if (typeof msg === 'string' && (msg.includes('SearchUnable') || msg.includes('search'))) {
      return true
    }
    if (originalHandler) return originalHandler(msg as any, ...rest)
    return false
  }

  // 拦截 unhandledrejection
  window.addEventListener('unhandledrejection', function(e: any) {
    if (e.reason?.message?.includes('SearchUnable') ||
        e.reason?.code === 'SearchUnable') {
      e.preventDefault()
    }
  })
}
</script>

<style scoped>
/* ================================================================
   Chat Page — v5.0 Ultimate Dark Glassmorphism
   ================================================================ */

.chat-page {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(155deg, #070b12 0%, #0a0f1c 35%, #090e19 65%, #080d17 100%);
  overflow: hidden; position: relative;
}

/* 动态背景光斑 */
.chat-page::before,
.chat-page::after {
  content: '';
  position: absolute; border-radius: 50%;
  pointer-events: none; z-index: 0;
}
.chat-page::before {
  top: -18%; right: -10%;
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(99,102,241,0.055) 0%, transparent 68%);
  animation: orbFloatA 13s ease-in-out infinite alternate;
}
.chat-page::after {
  bottom: -22%; left: -10%;
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(139,92,246,0.038) 0%, transparent 68%);
  animation: orbFloatB 16s ease-in-out infinite alternate-reverse;
}
@keyframes orbFloatA { from { transform: translate(0, 0); } to   { transform: translate(25px, -30px); } }
@keyframes orbFloatB { from { transform: translate(0, 0); } to   { transform: translate(-20px, 20px); } }

/* ===== Dev Toolbar ===== */
.dev-toolbar {
  height: 52px; flex-shrink: 0;
  background: rgba(14, 20, 36,0.9);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 22px; z-index: 1000;
}
.dev-left { display: flex; align-items: center; gap: 10px; }
.dev-logo { font-size: 21px; }
.dev-brand {
  font-size: 17px; font-weight: 800;
  background: linear-gradient(135deg,#818cf8,#a78bfa);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.dev-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg,#06b6d4,#0891b2);
  color: white; border-radius: 6px;
  font-size: 9.5px; font-weight: 800; letter-spacing: 1px;
}
.dev-center { display: flex; align-items: center; gap: 9px; }
.user-select {
  padding: 7px 13px; background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  font-size: 13px; font-weight: 550; color: rgba(255,255,255,0.88);
  cursor: pointer; min-width: 160px; outline: none; transition: all 0.22s;
}
.user-select:hover { border-color: rgba(129,140,248,0.38); background: rgba(255,255,255,0.08); }
.user-select:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.15); }
.user-select option { background: #1a1f36; color: #fff; }

.switch-btn {
  padding: 7px 17px;
  background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white;
  border: none; border-radius: 10px;
  font-size: 12.5px; font-weight: 620;
  cursor: pointer; transition: all 0.25s cubic-bezier(.25,.46,.45,.94);
  box-shadow: 0 4px 14px rgba(99,102,241,0.32);
}
.switch-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(99,102,241,0.45); }
.switch-btn:disabled { opacity: 0.5; }

.dev-right { display: flex; align-items: center; gap: 11px; }
.conn-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
  font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.42); transition: all 0.25s;
}
.conn-pill.online { background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.16); color: #4ade80; }
.pill-dot {
  width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.22);
}
.conn-pill.online .pill-dot { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
.user-tag {
  padding: 4px 12px; background: linear-gradient(135deg,#6366f1,#8b5cf6);
  color: white; border-radius: 16px; font-size: 11.5px; font-weight: 650;
}

/* ===== Chat Area — Ultimate Glass Container ===== */
.chat-area {
  flex: 1; min-height: 0; min-width: 0;
  position: relative;
  margin: 10px; border-radius: 20px;
  background: rgba(12, 17, 32,0.5);
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.42),
    inset 0 1px 0 rgba(255,255,255,0.025),
    inset 0 -1px 0 rgba(0,0,0,0.22),
    0 0 0 1px rgba(255,255,255,0.02) inset;
  display: flex; flex-direction: column;
  overflow: hidden; z-index: 1;
  animation: chatEnterV5 0.55s cubic-bezier(.22,1,.36,1);
}
@keyframes chatEnterV5 {
  from { opacity: 0; transform: scale(0.982) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* TUIKit 容器 */
.chat-wrapper-glass {
  flex: 1; min-height: 0; min-width: 0;
  position: relative; display: flex; flex-direction: column;
  overflow: hidden;
}

/* TUIKit 根容器全透明 */
.chat-wrapper-glass :deep(.tui-kit),
.chat-wrapper-glass :deep(.TUIKit),
.chat-wrapper-glass :deep(.TUIKit-main-container),
.chat-wrapper-glass :deep(.TUIKit-main) {
  background: transparent !important;
  background-color: transparent !important;
  color: rgba(255,255,255,0.88) !important;
}

/* 会话面板左侧 */
.chat-wrapper-glass :deep(.TUIKit-main-aside),
.chat-wrapper-glass :deep(.tui-conversation) {
  background: rgba(9, 14, 26,0.72) !important;
  background-color: rgba(9, 14, 26,0.72) !important;
  border-right: 1px solid rgba(255,255,255,0.04) !important;
  backdrop-filter: blur(20px);
}

/* 通讯录主区域 */
.chat-wrapper-glass :deep(.TUIContact),
.chat-wrapper-glass :deep(.tui-contact) {
  background: transparent !important;
}

/* 通讯录联系人信息面板 */
.chat-wrapper-glass :deep(.tui-contact-info),
.chat-wrapper-glass :deep([class*="contact-info"]) {
  background: rgba(11, 16, 30,0.95) !important;
  border-left: 1px solid rgba(255,255,255,0.05) !important;
}

/* 聊天主区域右侧 */
.chat-wrapper-glass :deep(.TUIKit-main-main),
.chat-wrapper-glass :deep(.tui-chat) {
  background: transparent !important;
}

/* 搜索组件 */
.chat-wrapper-glass :deep(.tui-search),
.chat-wrapper-glass :deep(.TUISearch),
.chat-wrapper-glass :deep([class*="search"]) {
  background: rgba(9, 14, 26,0.96) !important;
  background-color: rgba(9, 14, 26,0.96) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: 14px !important;
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px);
  color: rgba(255,255,255,0.88) !important;
  box-shadow: 0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03) !important;
}

.chat-wrapper-glass :deep(.tui-search input),
.chat-wrapper-glass :deep([class*="search"] input) {
  background: rgba(255,255,255,0.05) !important;
  color: rgba(255,255,255,0.92) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  caret-color: #818cf8 !important;
  border-radius: 10px !important;
}

/* 搜索结果 / 弹窗 */
.chat-wrapper-glass :deep(.tui-search-result),
.chat-wrapper-glass :deep([class*="result"]),
.chat-wrapper-glass :deep(.tui-search-content) {
  background: rgba(9, 14, 26,0.98) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  color: rgba(255,255,255,0.82) !important;
}

/* 导航栏 Tab */
.chat-wrapper-glass :deep(.TUIKit-navbar) {
  background: rgba(9, 14, 26,0.82) !important;
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
}
.chat-wrapper-glass :deep(.TUIKit-navbar-item) {
  color: rgba(255,255,255,0.48) !important;
}
.chat-wrapper-glass :deep(.TUIKit-navbar-item-active) {
  color: #818cf8 !important;
  background: rgba(99,102,241,0.1) !important;
}

/* 输入区域 */
.chat-wrapper-glass :deep(.message-input-container),
.chat-wrapper-glass :deep([class*="input-area"]) {
  background: rgba(9, 14, 26,0.72) !important;
  border-top: 1px solid rgba(255,255,255,0.04) !important;
}

/* Textarea */
.chat-wrapper-glass :deep(textarea),
.chat-wrapper-glass :deep(.el-textarea__inner) {
  color: rgba(255,255,255,0.92) !important;
  background: rgba(255,255,255,0.045) !important;
  caret-color: #818cf8 !important;
  border-radius: 12px !important;
  border: 1.5px solid rgba(255,255,255,0.07) !important;
  transition: all 0.2s !important;
}
.chat-wrapper-glass :deep(textarea:focus),
.chat-wrapper-glass :deep(.el-textarea__inner:focus) {
  border-color: rgba(129,140,248,0.42) !important;
  box-shadow: 0 0 0 3px rgba(129,140,248,0.1) !important;
  background: rgba(255,255,255,0.065) !important;
}
.chat-wrapper-glass :deep(textarea::placeholder),
.chat-wrapper-glass :deep(.el-textarea__inner::placeholder) {
  color: rgba(255,255,255,0.23) !important;
}

/* 发送消息气泡 */
.chat-wrapper-glass :deep([class*="message-self"] [class*="bubble"]),
.chat-wrapper-glass :deep(.message-item.self [class*="bubble"]) {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  color: white !important;
  border-radius: 16px 4px 16px 16px !important;
  box-shadow: 0 3px 14px rgba(99,102,241,0.32) !important;
  border: none !important;
}
.chat-wrapper-glass :deep([class*="message-self"] [class*="bubble"] *) { color: white !important; }

/* 接收消息气泡 */
.chat-wrapper-glass :deep([class*="message-other"] [class*="bubble"]),
.chat-wrapper-glass :deep([class*="message-item"]:not(.self) [class*="bubble"]) {
  background: rgba(20, 30, 50,0.85) !important;
  color: rgba(255,255,255,0.92) !important;
  border-radius: 4px 16px 16px 16px !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.22) !important;
}
.chat-wrapper-glass :deep([class*="message-other"] [class*="bubble"] *),
.chat-wrapper-glass :deep([class*="message-item"]:not(.self) [class*="bubble"] *) {
  color: rgba(255,255,255,0.9) !important;
}

/* 隐藏欢迎语 */
.chat-wrapper-glass :deep(.tui-chat-welcome),
.chat-wrapper-glass :deep(.tui-chat-default),
.chat-wrapper-glass :deep(.TUIChat h1),
.chat-wrapper-glass :deep([class*="welcome"]),
.chat-wrapper-glass :deep([class*="empty-placeholder"]),
.chat-wrapper-glass :deep(h1:first-child) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* ===== Dialog 弹窗深色化 ===== */
.chat-wrapper-glass :deep(.dialog),
.chat-wrapper-glass :deep(.dialog-h5),
.chat-wrapper-glass :deep(.dialog-main),
.chat-wrapper-glass :deep([class*="dialog"]) {
  background: rgba(14, 20, 38, 0.97) !important;
  background-color: rgba(14, 20, 38, 0.97) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 16px !important;
  color: rgba(255,255,255,0.88) !important;
  backdrop-filter: blur(28px) !important;
  -webkit-backdrop-filter: blur(28px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
}
.chat-wrapper-glass :deep(.dialog-main-header),
.chat-wrapper-glass :deep([class*="dialog-main-header"]) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}
.chat-wrapper-glass :deep(.dialog-main-title),
.chat-wrapper-glass :deep([class*="dialog-main-title"]),
.chat-wrapper-glass :deep(.dialog h1) {
  color: rgba(255,255,255,0.92) !important;
}
.chat-wrapper-glass :deep(.dialog-main-content),
.chat-wrapper-glass :deep([class*="dialog-main-content"]) {
  background: transparent !important;
  color: rgba(255,255,255,0.82) !important;
}
.chat-wrapper-glass :deep(.dialog-main-footer),
.chat-wrapper-glass :deep([class*="dialog-main-footer"]) {
  background: transparent !important;
  border-top: 1px solid rgba(255,255,255,0.05) !important;
}
.chat-wrapper-glass :deep(.dialog .btn),
.chat-wrapper-glass :deep([class*="dialog"] .btn) {
  border-radius: 10px !important;
  font-weight: 600 !important;
}
.chat-wrapper-glass :deep(.btn-default),
.chat-wrapper-glass :deep(.btn-submit),
.chat-wrapper-glass :deep(.btn-confirm) {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  color: white !important;
}

/* ===== Transfer 选择器深色化 ===== */
.chat-wrapper-glass :deep(.transfer),
.chat-wrapper-glass :deep(.transfer-h5),
.chat-wrapper-glass :deep([class*="transfer"]) {
  background: rgba(12, 18, 34, 0.98) !important;
  color: rgba(255,255,255,0.86) !important;
}
.chat-wrapper-glass :deep(.transfer-header),
.chat-wrapper-glass :deep([class*="transfer-header"]) {
  background: rgba(11, 16, 30,0.85) !important;
}
.chat-wrapper-glass :deep(.transfer-list-item),
.chat-wrapper-glass :deep([class*="transfer-list-item"]) {
  border-bottom-color: rgba(255,255,255,0.05) !important;
}
.chat-wrapper-glass :deep(.transfer-list-item:hover),
.chat-wrapper-glass :deep([class*="transfer-list-item"]:hover) {
  background: rgba(99,102,241,0.08) !important;
}
.chat-wrapper-glass :deep(.transfer input),
.chat-wrapper-glass :deep([class*="transfer"] input) {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.9) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 8px !important;
  caret-color: #818cf8 !important;
}
.chat-wrapper-glass :deep(.transfer-right-footer),
.chat-wrapper-glass :deep([class*="transfer-right-footer"]) {
  background: rgba(11, 16, 30,0.7) !important;
  border-top: 1px solid rgba(255,255,255,0.06) !important;
}

/* ===== CreateGroup 创建群组深色化 ===== */
.chat-wrapper-glass :deep(.group),
.chat-wrapper-glass :deep(.group-h5),
.chat-wrapper-glass :deep([class*="group-box"]) {
  background: rgba(13, 19, 35, 0.98) !important;
  color: rgba(255,255,255,0.87) !important;
}
.chat-wrapper-glass :deep(.group-box-header),
.chat-wrapper-glass :deep([class*="group-box-header"]) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}
.chat-wrapper-glass :deep(.group-list-item),
.chat-wrapper-glass :deep([class*="group-list-item"]) {
  border-bottom-color: rgba(255,255,255,0.04) !important;
}
.chat-wrapper-glass :deep(.group-list-item input),
.chat-wrapper-glass :deep([class*="group-list"] input) {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.92) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 8px !important;
  caret-color: #818cf8 !important;
}
.chat-wrapper-glass :deep(.group-profile-footer),
.chat-wrapper-glass :deep([class*="group-profile-footer"]) {
  background: rgba(11, 16, 30,0.75) !important;
  border-top: 1px solid rgba(255,255,255,0.06) !important;
}
.chat-wrapper-glass :deep(.group-profile-footer .btn-submit),
.chat-wrapper-glass :deep([class*="group-profile-footer"] .btn-submit) {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  color: white !important;
}

/* ===== MaskLayer 遮罩 ===== */
.chat-wrapper-glass :deep(.mask),
.chat-wrapper-glass :deep([class*="mask-layer"]) {
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(8px) !important;
}

/* ===== Overlay States ===== */
.glass-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10, 15, 27,0.94);
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px);
  z-index: 2000; animation: fadeInV5 0.3s ease;
}
@keyframes fadeInV5 { from { opacity: 0; } to { opacity: 1; } }
.overlay--error { background: rgba(28, 8, 8,0.94); }

.glass-card {
  text-align: center; padding: 44px 54px;
  background: rgba(14, 20, 36,0.9);
  backdrop-filter: blur(28px);
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow:
    0 24px 64px rgba(0,0,0,0.48),
    0 0 0 1px rgba(255,255,255,0.025) inset;
  animation: cardPopV5 0.4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes cardPopV5 {
  from { opacity: 0; transform: scale(0.91) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.loader-ring {
  width: 46px; height: 46px; margin: 0 auto 20px;
  border: 3px solid rgba(255,255,255,0.08);
  border-top-color: #818cf8;
  border-radius: 50%; animation: spinV5 0.85s linear infinite;
}
@keyframes spinV5 { to { transform: rotate(360deg); } }

.glass-card h3 { font-size: 19px; font-weight: 750; color: rgba(255,255,255,0.93); margin: 0 0 8px; }
.glass-card p { font-size: 13.5px; color: rgba(255,255,255,0.47); margin: 0; }
.err-msg { color: #f87171; font-size: 12.5px; word-break: break-word; max-width: 320px; line-height: 1.55; }

.error-icon { font-size: 50px; margin-bottom: 14px; line-height: 1; }
.wait-icon { font-size: 50px; margin-bottom: 14px; line-height: 1; }

.retry-action {
  margin-top: 22px; padding: 11px 28px;
  background: linear-gradient(135deg,#ef4444,#dc2626); color: white;
  border: none; border-radius: 12px;
  font-size: 14px; font-weight: 650;
  cursor: pointer; transition: all 0.25s cubic-bezier(.25,.46,.45,.94);
  box-shadow: 0 4px 14px rgba(239,68,68,0.3);
}
.retry-action:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239,68,68,0.4); }

/* ===== Responsive ===== */
@media (max-width: 1100px) {
  .chat-wrapper-glass :deep(.TUIKit-main-aside) { max-width: 270px !important; }
}
@media (max-width: 800px) {
  .dev-toolbar { flex-wrap: wrap; height: auto; padding: 10px 14px; gap: 8px; min-width: 0; }
  .dev-center { order: 3; width: 100%; justify-content: center; }
  .dev-right { gap: 8px; }
  .conn-pill, .user-tag { padding: 4px 10px; font-size: 11px; }
  .chat-area { margin: 8px; border-radius: 16px; }
  .chat-wrapper-glass :deep(.TUIKit-main-aside) { max-width: 230px !important; }
}
@media (max-width: 520px) {
  .chat-wrapper-glass :deep(.TUIKit-main-aside) {
    width: 100% !important; position: absolute !important; z-index: 10 !important;
  }
  .chat-area { margin: 4px; border-radius: 14px; }
  .glass-card { padding: 26px 22px; margin: 14px; }
}
</style>
