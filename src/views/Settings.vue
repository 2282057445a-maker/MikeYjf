<template>
  <div class="settings-page">
    <!-- 头部 -->
    <div class="settings-header">
      <h1>⚙️ 设置</h1>
      <p>管理你的账号和偏好设置</p>
    </div>

    <div class="s-content">

      <!-- ===== 个人资料 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">👤</span>
          <h2>个人资料</h2>
        </div>
        <div class="card-body">
          <div class="profile-layout">
            <div class="avatar-glass" @click="triggerAvatarUpload">
              <img :src="userAvatar" alt="" class="avatar-lg" />
              <button class="avatar-edit" title="更换头像">📷</button>
              <!-- 隐藏的文件选择器 -->
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>
            <div class="profile-form">
              <div class="field">
                <label>用户名</label>
                <input v-model="localUsername" type="text" class="glass-input"
                       placeholder="输入用户名" @keyup.enter="doSaveProfile" />
              </div>
              <div class="field">
                <label>个性签名</label>
                <textarea v-model="localSignature" class="glass-textarea"
                          placeholder="介绍一下自己..." rows="3"></textarea>
              </div>
              <button @click="doSaveProfile" class="save-action" :class="{ saved: justSaved }">
                {{ justSaved ? '✅ 已保存' : '💾 保存修改' }}
              </button>
              <span v-if="justSaved" class="save-hint">已保存到本地存储 ✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 账号安全 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">🔐</span>
          <h2>账号安全</h2>
          <span class="card-badge card-badge--safe">{{ securityLevel }}</span>
        </div>
        <div class="card-body">
          <!-- 修改密码 -->
          <div class="security-section">
            <h3 class="sec-title"><span>🔑</span> 修改密码</h3>
            <div class="pwd-form">
              <div class="field">
                <label>当前密码</label>
                <div class="pwd-wrap">
                  <input :type="showCurPwd ? 'text' : 'password'" v-model="pwdForm.current"
                         class="glass-input" placeholder="输入当前密码" />
                  <button class="eye-btn" @click="showCurPwd = !showCurPwd">
                    {{ showCurPwd ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
              <div class="field">
                <label>新密码</label>
                <div class="pwd-wrap">
                  <input :type="showNewPwd ? 'text' : 'password'" v-model="pwdForm.newPass"
                         class="glass-input" placeholder="输入新密码 (至少6位)" />
                  <button class="eye-btn" @click="showNewPwd = !showNewPwd">
                    {{ showNewPwd ? '🙈' : '👁️' }}
                  </button>
                </div>
                <div v-if="pwdStrength" class="strength-bar">
                  <div class="strength-fill" :class="'strength--' + pwdStrength.level"
                       :style="{ width: pwdStrength.percent }"></div>
                  <span class="strength-text">{{ pwdStrength.label }}</span>
                </div>
              </div>
              <div class="field">
                <label>确认新密码</label>
                <input type="password" v-model="pwdForm.confirm" class="glass-input"
                       placeholder="再次输入新密码" />
              </div>
              <button @click="doChangePassword" class="save-action" :disabled="isChangingPwd">
                {{ isChangingPwd ? '修改中...' : '🔒 修改密码' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 安全选项 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">🛡️</span>
          <h2>安全设置</h2>
        </div>
        <div class="card-body">
          <div v-for="item in securityItems" :key="item.key" class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ item.name }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <label class="ios-toggle" :class="{ on: securitySettings[item.key] }"
                   @click.prevent="toggleSecurity(item.key)">
              <input type="checkbox" :checked="securitySettings[item.key]" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>
          <div class="setting-footer">
            <span>💡 安全设置已自动保存</span>
          </div>
        </div>
      </div>

      <!-- ===== 通知设置 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">🔔</span>
          <h2>通知设置</h2>
          <span class="card-badge">{{ notifCount }} 项开启</span>
        </div>
        <div class="card-body">
          <div v-for="item in notifItems" :key="item.key" class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ item.name }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <label class="ios-toggle" :class="{ on: notifications[item.key] }"
                   @click.prevent="toggleNotif(item.key)">
              <input type="checkbox" :checked="notifications[item.key]" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>
          <div class="setting-footer">
            <span>💡 设置已自动保存</span>
          </div>
        </div>
      </div>

      <!-- ===== 隐私设置 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">🔒</span>
          <h2>隐私设置</h2>
          <span class="card-badge">{{ privacyCount }} 项开启</span>
        </div>
        <div class="card-body">
          <div v-for="item in privacyItems" :key="item.key" class="setting-row">
            <div class="setting-info">
              <div class="setting-name">{{ item.name }}</div>
              <div class="setting-desc">{{ item.desc }}</div>
            </div>
            <label class="ios-toggle" :class="{ on: privacy[item.key] }"
                   @click.prevent="togglePrivacy(item.key)">
              <input type="checkbox" :checked="privacy[item.key]" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
            </label>
          </div>
          <div class="setting-footer">
            <span>💡 设置已自动保存</span>
          </div>
        </div>
      </div>

      <!-- ===== 外观（主题色选择）— 功能修复版 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">🎨</span>
          <h2>外观</h2>
          <span class="card-badge card-badge--theme">{{ currentThemeName }}</span>
        </div>
        <div class="card-body">
          <!-- 深色模式提示 -->
          <div class="setting-row" style="border-bottom:none;">
            <div class="setting-info">
              <div class="setting-name">主题模式</div>
              <div class="setting-desc">当前使用深色玻璃拟态风格</div>
            </div>
            <span class="info-tag active-tag">深色</span>
          </div>
          <!-- 主题色选择器 — 点击即生效 -->
          <div class="color-section">
            <div class="color-label">品牌强调色</div>
            <div class="color-picker">
              <button
                v-for="(t, key) in themeOptions"
                :key="key"
                class="color-swatch"
                :class="{ active: themeColor === key }"
                :style="{ background: t.gradient }"
                :title="t.name"
                @click="applyTheme(key)"
              ></button>
            </div>
            <p class="color-hint">点击切换全局品牌色，即时生效并自动保存</p>
          </div>
          <!-- 实时预览 -->
          <div class="theme-preview">
            <div class="preview-card" :style="{ borderColor: currentPrimary + '40', background: currentPrimary + '12' }">
              <div class="preview-dot" :style="{ background: currentGradient }"></div>
              <span>当前主题预览 · {{ currentThemeName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 关于 ===== -->
      <div class="s-card">
        <div class="card-head">
          <span class="card-icon">ℹ️</span>
          <h2>关于</h2>
        </div>
        <div class="card-body">
          <div class="about-row"><span>版本</span><span class="av mono">v5.1 Ultimate</span></div>
          <div class="about-row"><span>底层服务</span><span>腾讯云 IM SDK</span></div>
          <div class="about-row about-last"><span>SDKAppID</span><span class="av mono">{{ sdkID }}</span></div>
          <div class="about-links">
            <a href="https://cloud.tencent.com/document/product/269" target="_blank" rel="noreferrer" class="al-link">📖 IM 文档</a>
            <a href="https://github.com/TencentCloud/chat-uikit-vue" target="_blank" rel="noreferrer" class="al-link">🐙 GitHub</a>
          </div>
        </div>
      </div>

      <!-- ===== 危险操作 ===== -->
      <div class="s-card s-card--danger">
        <div class="card-head card-head--danger">
          <span class="card-icon">⚠️</span>
          <h2>账号操作</h2>
        </div>
        <div class="card-body">
          <p class="danger-text">退出后需要重新登录账号，当前会话将断开</p>
          <button @click="handleLogout" class="danger-btn" :disabled="isLoggingOut">
            {{ isLoggingOut ? '退出中...' : '退出登录' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useIMLogin } from '../composables/useIMLogin'
import {
  username as storeUsername,
  signature as storeSignature,
  themeColor, setThemeColor,
  notifications, privacy, saveNotifications, savePrivacy,
  themeColors,
} from '../composables/useAppStore'

const router = useRouter()
const { logout: imLogout, isLoggingIn, currentUserID, SDKAppID } = useIMLogin()
const isLoggingOut = ref(false)

// 本地编辑状态
const localUsername = ref(storeUsername.value || currentUserID.value || '')
const localSignature = ref(storeSignature.value)
const justSaved = ref(false)

// 头像上传
const avatarInputRef = ref<HTMLInputElement | null>(null)
const customAvatarUrl = ref('')

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB')
    return
  }
  // 使用 FileReader 预览本地图片
  const reader = new FileReader()
  reader.onload = () => {
    customAvatarUrl.value = reader.result as string
    localStorage.setItem('mikechat_custom_avatar', reader.result as string)
    ElMessage.success('✅ 头像已更新')
  }
  reader.readAsDataURL(file)
}

// 计算属性
const userAvatar = computed(() => {
  return customAvatarUrl.value ||
    localStorage.getItem('mikechat_custom_avatar') ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserID.value || 'default'}&backgroundColor=b6e3f4`
})
const sdkID = computed(() => String(SDKAppID))
const currentThemeName = computed(() =>
  (themeColors[themeColor.value] || themeColors['purple-blue']).name
)

// 当前主题色的 CSS 值（用于实时预览）
const currentPrimary = computed(() => {
  const t = themeColors[themeColor.value] || themeColors['purple-blue']
  return t.primary
})
const currentGradient = computed(() => {
  const t = themeColors[themeColor.value] || themeColors['purple-blue']
  return `linear-gradient(135deg, ${t.primary}, ${t.secondary})`
})

const notifCount = computed(() =>
  Object.values(notifications).filter(Boolean).length
)
const privacyCount = computed(() =>
  Object.values(privacy).filter(Boolean).length
)

// 安全等级
const securityLevel = computed(() => {
  const enabled = Object.values(securitySettings).filter(Boolean).length
  if (enabled >= 3) return '高'
  if (enabled >= 1) return '中'
  return '低'
})

// 主题选项
const themeOptions = Object.fromEntries(
  Object.entries(themeColors).map(([k, v]) => [k, {
    ...v,
    gradient: `linear-gradient(135deg, ${v.primary}, ${v.secondary})`
  }])
) as Record<string, { primary: string; secondary: string; name: string; gradient: string }>

/* ========== 密码修改 ========== */
const showCurPwd = ref(false)
const showNewPwd = ref(false)
const isChangingPwd = ref(false)
const pwdForm = reactive({
  current: '',
  newPass: '',
  confirm: ''
})

// 密码强度检测
const pwdStrength = computed(() => {
  const p = pwdForm.newPass
  if (!p) return null
  let level = 1, percent = '25%', label = '\u5f31'
  if (p.length >= 6) { level = 2; percent = '50%'; label = '\u4e00\u822c' }
  if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) { level = 3; percent = '75%'; label = '\u5f3a' }
  if (p.length >= 10 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) {
    level = 4; percent = '100%'; label = '非常强'
  }
  return { level, percent, label }
})

async function doChangePassword() {
  if (!pwdForm.current) { ElMessage.warning('请输入当前密码'); return }
  if (!pwdForm.newPass || pwdForm.newPass.length < 6) { ElMessage.warning('新密码至少6位'); return }
  if (pwdForm.newPass !== pwdForm.confirm) { ElMessage.warning('两次密码不一致'); return }

  isChangingPwd.value = true
  try {
    // 模拟密码修改（实际项目中应调后端 API）
    await new Promise(r => setTimeout(r, 1200))
    // 清空表单
    pwdForm.current = ''
    pwdForm.newPass = ''
    pwdForm.confirm = ''
    ElMessage.success('✅ 密码修改成功！')
  } catch (e) {
    ElMessage.error('修改失败，请重试')
  } finally {
    isChangingPwd.value = false
  }
}

/* ========== 安全设置（新增） ========== */
function loadSecurity() {
  try {
    const saved = JSON.parse(localStorage.getItem('mikechat_security') || '{}')
    Object.assign(securitySettings, {
      twoFactor: saved.twoFactor ?? false,
      loginNotify: saved.loginNotify ?? true,
      sessionTimeout: saved.sessionTimeout ?? false,
      deviceAuth: saved.deviceAuth ?? true,
    })
  } catch {}
}
const securitySettings = reactive<Record<string, boolean>>({
  twoFactor: false,
  loginNotify: true,
  sessionTimeout: false,
  deviceAuth: true,
})
loadSecurity()

function toggleSecurity(key: string) {
  securitySettings[key] = !securitySettings[key]
  localStorage.setItem('mikechat_security', JSON.stringify({ ...securitySettings }))
  const itemName = securityItems.find(i => i.key === key)?.name || key
  if (securitySettings[key]) {
    ElMessage.success(`已开启「${itemName}」`)
  }
}
const securityItems = [
  { key: 'twoFactor',     name: '两步验证',   desc: '登录时需要额外的手机/邮箱验证码' },
  { key: 'loginNotify',   name: '登录通知',   desc: '在新设备登录时发送通知提醒' },
  { key: 'sessionTimeout',name: '会话超时',   desc: '长时间无操作后自动退出登录' },
  { key: 'deviceAuth',    name: '设备管理',   desc: '查看和管理已授权的登录设备' },
]

/* ========== 通知开关切换 ========== */
const notifItems = [
  { key: 'message', name: '消息通知', desc: '接收新消息时显示通知' },
  { key: 'sound',   name: '声音提示', desc: '收到消息时播放提示音' },
  { key: 'desktop', name: '桌面通知', desc: '系统托盘显示通知' },
]
function toggleNotif(key: string) {
  const newVal = !notifications[key]
  notifications[key] = newVal
  saveNotifications()
  if (newVal) {
    ElMessage.success(`已开启「${notifItems.find(i => i.key === key)?.name}」`)
  }
}

/* ========== 隐私开关切换 ========== */
const privacyItems = [
  { key: 'showOnline',         name: '在线状态',     desc: '让好友看到你的在线状态' },
  { key: 'readReceipt',        name: '已读回执',     desc: '发送已读状态给对方' },
  { key: 'friendVerification', name: '好友验证',     desc: '需要验证才可添加为好友' },
]
function togglePrivacy(key: string) {
  privacy[key] = !privacy[key]
  savePrivacy()
}

/* ========== 主题色切换 — 真正生效版本 ========== */
function applyTheme(key: string) {
  setThemeColor(key)
  // 通过 CSS 变量注入到根元素（立即生效）
  const t = themeColors[key] || themeColors['purple-blue']
  document.documentElement.style.setProperty('--mc-accent-primary', t.primary)
  document.documentElement.style.setProperty('--mc-accent-secondary', t.secondary)
  document.documentElement.style.setProperty(
    '--mc-accent-gradient',
    `linear-gradient(135deg, ${t.primary}, ${t.secondary})`
  )
  ElMessage.success({ message: `已切换为 ${currentThemeName.value}`, duration: 1500 })
}

// 初始化时应用当前主题色到 CSS 变量
applyTheme(themeColor.value)

/* ========== 个人资料保存 ========== */
function doSaveProfile() {
  if (!localUsername.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  storeUsername.value = localUsername.value.trim()
  storeSignature.value = localSignature.value
  justSaved.value = true
  ElMessage.success('✅ 个人资料已保存')
  setTimeout(() => { justSaved.value = false }, 2500)
}

/* ========== 退出登录 ========== */
async function handleLogout() {
  isLoggingOut.value = true
  try {
    await imLogout()
    ElMessage.info('已退出登录')
    router.push('/')
  } catch (e) {
    console.error('退出失败:', e)
    ElMessage.error('退出失败，请重试')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* ================================================================
   Settings Page — v4.0 Deep Dark Glass Edition
   ================================================================ */

.settings-page {
  width: 100%; height: 100%;
  overflow-y: auto; padding: 0;
}
.settings-page::-webkit-scrollbar { width: 5px; }
.settings-page::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 3px; }

/* Header */
.settings-header { padding: 4px 0 24px; }
.settings-header h1 {
  font-size: 26px; font-weight: 780;
  color: rgba(255,255,255,0.93); margin: 0 0 5px;
}
.settings-header p { font-size: 14px; color: rgba(255,255,255,0.45); margin: 0; }

.s-content { display: flex; flex-direction: column; gap: 16px; padding-bottom: 20px; }

/* ===== Card (Deep Dark Glass) ===== */
.s-card {
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  overflow: hidden;
  transition: box-shadow 0.25s, transform 0.25s;
}
.s-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.22); }

.card-head {
  display: flex; align-items: center; gap: 10px;
  padding: 17px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.card-icon { font-size: 18px; line-height: 1; }
.card-head h2 { font-size: 15px; font-weight: 720; color: rgba(255,255,255,0.9); margin: 0; }
.card-badge {
  margin-left: auto; padding: 3px 10px;
  background: rgba(99,102,241,0.15);
  border-radius: 8px;
  font-size: 11px; font-weight: 650;
  color: #a5b4fc;
}
.card-badge--theme { background: rgba(139,92,246,0.15); color: #c4b5fd; }
.card-badge--safe { background: rgba(34,197,94,0.12); color: #4ade80; }

.card-head--danger { background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.08); }
.s-card--danger { border-color: rgba(239,68,68,0.10); }

.card-body { padding: 18px 22px; }

/* ===== Profile ===== */
.profile-layout { display: flex; gap: 24px; align-items: flex-start; }

.avatar-glass {
  position: relative; flex-shrink: 0; cursor: pointer;
  transition: transform 0.2s;
}
.avatar-glass:hover { transform: scale(1.03); }
.avatar-glass:hover .avatar-edit { opacity: 1; }

.avatar-lg {
  width: 90px; height: 90px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.1);
  object-fit: cover;
  background: rgba(30,41,59,0.8);
  display: block;
}
.avatar-edit {
  position: absolute; bottom: 2px; right: 2px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 2px solid rgba(17,24,39,0.7);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
  opacity: 0.85;
}
.avatar-edit:hover { transform: scale(1.15); opacity: 1; }

.profile-form { flex: 1; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 620; color: rgba(255,255,255,0.65); }

.glass-input, .glass-textarea {
  padding: 11px 15px;
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 11px;
  font-size: 14px; color: rgba(255,255,255,0.92);
  background: rgba(255,255,255,0.05);
  transition: all 0.2s;
  font-family: inherit;
  outline: none;
}
.glass-input:focus, .glass-textarea:focus {
  border-color: rgba(129,140,248,0.45);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(129,140,248,0.1);
}
.glass-input::placeholder, .glass-textarea::placeholder { color: rgba(255,255,255,0.25); }
.glass-textarea { resize: vertical; min-height: 60px; line-height: 1.5; }

.save-action {
  align-self: flex-start;
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; border: none;
  border-radius: 11px;
  font-size: 14px; font-weight: 650;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}
.save-action:hover:not(:disabled):not(.saved) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99,102,241,0.48);
}
.save-action.saved {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 4px 14px rgba(34,197,94,0.35);
}
.save-action:disabled {
  opacity: 0.55; cursor: not-allowed;
}

.save-hint { font-size: 12px; color: rgba(34,197,94,0.7); margin-top: -8px; }

/* ===== Password Section ===== */
.security-section { display: flex; flex-direction: column; gap: 14px; }
.sec-title {
  font-size: 14px; font-weight: 700;
  color: rgba(255,255,255,0.88); margin: 0;
  display: flex; align-items: center; gap: 6px;
}
.pwd-form { display: flex; flex-direction: column; gap: 12px; }
.pwd-wrap { position: relative; display: flex; align-items: center; }
.pwd-wrap .glass-input { padding-right: 44px; width: 100%; }
.eye-btn {
  position: absolute; right: 10px;
  background: none; border: none;
  cursor: pointer; font-size: 16px;
  padding: 4px; line-height: 1;
  transition: transform 0.2s;
}
.eye-btn:hover { transform: scale(1.15); }

/* Strength bar */
.strength-bar { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.strength-flex {
  flex: 1; height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px; overflow: hidden;
}
.strength-fill {
  height: 100%; border-radius: 2px;
  transition: all 0.3s ease;
}
.strength--1 { background: #ef4444; }
.strength--2 { background: #f59e0b; }
.strength--3 { background: #22c55e; }
.strength--4 { background: #06b6d4; }
.strength-text {
  font-size: 11px; font-weight: 600;
  min-width: 45px;
}
.strength--1 ~ .strength-text { color: #ef4444; }
.strength--2 ~ .strength-text { color: #f59e0b; }
.strength--3 ~ .strength-text { color: #22c55e; }
.strength--4 ~ .strength-text { color: #06b6d4; }

/* ===== Setting Rows ===== */
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.setting-name { font-size: 14px; font-weight: 620; color: rgba(255,255,255,0.88); margin-bottom: 2px; }
.setting-desc { font-size: 12px; color: rgba(255,255,255,0.38); }

.setting-footer {
  text-align: right; padding: 10px 0 0;
  font-size: 11.5px; color: rgba(255,255,255,0.3);
}

.info-tag {
  padding: 4px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4);
}
.active-tag {
  background: rgba(34,197,94,0.1); color: #4ade80;
  border: 1px solid rgba(34,197,94,0.15);
}

/* ===== iOS Toggle Switch (Dark) ===== */
.ios-toggle {
  position: relative;
  width: 51px; height: 31px;
  flex-shrink: 0; cursor: pointer;
}
.ios-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }

.toggle-track {
  position: absolute; inset: 0;
  border-radius: 16px;
  background: rgba(255,255,255,0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-track::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 27px; height: 27px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ios-toggle.on .toggle-track { background: linear-gradient(135deg, #34c759, #30d158); }
.ios-toggle.on .toggle-track::after { transform: translateX(20px); }

/* ===== Color Picker ===== */
.color-section { margin-top: 4px; }
.color-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 10px; }
.color-picker { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.color-swatch {
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2.5px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.color-swatch:hover { transform: scale(1.18); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.color-swatch.active {
  border-color: white;
  box-shadow:
    0 0 0 3px rgba(129,140,248,0.4),
    0 4px 14px rgba(0,0,0,0.25);
  transform: scale(1.12);
}
.color-hint { font-size: 11.5px; color: rgba(255,255,255,0.28); margin: 10px 0 0; }

/* Theme Preview Card */
.theme-preview { margin-top: 14px; }
.preview-card {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.72);
  transition: all 0.3s;
}
.preview-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(99,102,248,0.4);
}

/* ===== About ===== */
.about-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 13px;
}
.about-row span:first-child { color: rgba(255,255,255,0.42); }
.about-last { border-bottom: none !important; }
.av { font-weight: 600; color: rgba(255,255,255,0.82); }
.mono { font-family: 'SF Mono', ui-monospace, monospace; font-size: 12px; }

.about-links { display: flex; gap: 9px; padding-top: 14px; flex-wrap: wrap; }
.al-link {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  font-size: 13px; font-weight: 550;
  color: rgba(255,255,255,0.72); text-decoration: none;
  transition: all 0.2s;
}
.al-link:hover {
  background: rgba(99,102,241,0.12);
  color: #a5b4fc;
  border-color: rgba(99,102,241,0.2);
  transform: translateY(-1px);
}

/* ===== Danger Zone ===== */
.danger-text { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 14px; }
.danger-btn {
  padding: 11px 28px;
  background: rgba(239,68,68,0.1); color: #f87171;
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 11px;
  font-size: 14px; font-weight: 650;
  cursor: pointer;
  transition: all 0.2s;
}
.danger-btn:hover:not(:disabled) {
  background: rgba(239,68,68,0.18);
  border-color: rgba(239,68,68,0.35);
  transform: translateY(-1px);
}
.danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== Responsive ===== */
@media (max-width: 600px) {
  .profile-layout { flex-direction: column; align-items: center; }
  .profile-form { width: 100%; }
  .save-action { width: 100%; justify-content: center; }
}
</style>
