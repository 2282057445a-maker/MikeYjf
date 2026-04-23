<template>
  <div class="login-page">
    <!-- 背景动画 -->
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <div class="login-container">
      <!-- Logo & Brand -->
      <div class="brand-section">
        <div class="logo-circle">
          <span class="logo-letter">M</span>
        </div>
        <h1 class="brand-name">MikeChat</h1>
        <p class="brand-sub">安全 · 快速 · 美观的即时通讯</p>
      </div>

      <!-- 登录 / 注册 切换 -->
      <div class="tab-bar">
        <button :class="['tab-btn', { active: mode === 'login' }]" @click="mode = 'login'">
          🔐 登录
        </button>
        <button :class="['tab-btn', { active: mode === 'register' }]" @click="mode = 'register'">
          📝 注册
        </button>
        <div class="tab-indicator" :class="'ind-' + mode"></div>
      </div>

      <!-- ===== 登录表单 ===== -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="field">
          <label>用户 ID</label>
          <input v-model="loginForm.userID" type="text" class="glass-input"
                 placeholder="输入用户ID (如 yangjiafan)" required autocomplete="username" />
        </div>
        <div class="field">
          <label>密码</label>
          <div class="pwd-wrap">
            <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'"
                   class="glass-input" placeholder="输入密码" required autocomplete="current-password" />
            <button type="button" class="eye-btn" @click="showPwd = !showPwd">
              {{ showPwd ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '⏳ 登录中...' : '🚀 进入聊天' }}
        </button>
        <p class="form-footer">
          还没有账号？<a href="#" @click.prevent="mode = 'register'" class="link-accent">立即注册</a>
        </p>
      </form>

      <!-- ===== 注册表单 ===== -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="field">
          <label>用户 ID</label>
          <input v-model="registerForm.userID" type="text" class="glass-input"
                 placeholder="设置用户ID (字母+数字)" required minlength="3" />
        </div>
        <div class="field">
          <label>昵称</label>
          <input v-model="registerForm.nickname" type="text" class="glass-input"
                 placeholder="你的昵称" required />
        </div>
        <div class="field">
          <label>密码</label>
          <div class="pwd-wrap">
            <input v-model="registerForm.password" :type="showRegPwd1 ? 'text' : 'password'"
                   class="glass-input" placeholder="至少6位密码" required minlength="6" />
            <button type="button" class="eye-btn" @click="showRegPwd1 = !showRegPwd1">
              {{ showRegPwd1 ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>确认密码</label>
          <input v-model="registerForm.confirmPwd" :type="showRegPwd2 ? 'text' : 'password'"
                 class="glass-input" placeholder="再次输入密码" required />
        </div>
        <button type="submit" class="submit-btn submit-btn--reg" :disabled="isSubmitting">
          {{ isSubmitting ? '⏳ 注册中...' : '✨ 创建账号' }}
        </button>
        <p class="form-footer">
          已有账号？<a href="#" @click.prevent="mode = 'login'" class="link-accent">返回登录</a>
        </p>
      </form>

      <!-- 快速登录（开发模式快捷入口） -->
      <div class="quick-users">
        <p class="quick-label">快速体验 (开发模式)</p>
        <div class="quick-list">
          <button v-for="u in quickUsers" :key="u" @click="quickLogin(u)"
                  class="quick-user-btn">{{ u }}</button>
        </div>
      </div>

      <!-- 版本信息 -->
      <p class="version-tag">MikeChat v5.1 Ultimate · Deep Dark Edition</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useIMLogin } from '../composables/useIMLogin'

const router = useRouter()
const { login: imLogin } = useIMLogin()

const mode = ref<'login' | 'register'>('login')
const isSubmitting = ref(false)
const showPwd = ref(false)
const showRegPwd1 = ref(false)
const showRegPwd2 = ref(false)

// 登录表单
const loginForm = reactive({ userID: '', password: '' })

// 注册表单
const registerForm = reactive({ userID: '', nickname: '', password: '', confirmPwd: '' })

// 快捷用户列表
const quickUsers = ['yangjiafan', 'mike001', 'mike002', 'testuser']

/* ========== 登录 ========== */
async function handleLogin() {
  if (!loginForm.userID.trim()) {
    ElMessage.warning('请输入用户 ID')
    return
  }
  isSubmitting.value = true
  try {
    // 密码验证：本地存储模拟 (实际项目应调后端 API)
    const savedUser = JSON.parse(localStorage.getItem('mikechat_user_' + loginForm.userID) || '{}')
    if (!savedUser.password) {
      // 没有注册记录，直接用 IM SDK 登录（兼容测试用户）
      await imLogin(loginForm.userID)
      ElMessage.success('✅ 登录成功')
      router.push('/app/dashboard')
    } else if (savedUser.password !== loginForm.password) {
      ElMessage.error('❌ 用户名或密码错误')
    } else {
      await imLogin(loginForm.userID)
      ElMessage.success('✅ 登录成功，欢迎回来！')
      router.push('/app/dashboard')
    }
  } catch (e: any) {
    console.error('登录失败:', e)
    ElMessage.error(`登录失败: ${e.message || '未知错误'}`)
  } finally {
    isSubmitting.value = false
  }
}

/* ========== 注册 ========== */
async function handleRegister() {
  if (!registerForm.userID.trim() || registerForm.userID.length < 3) {
    ElMessage.warning('用户 ID 至少 3 个字符')
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(registerForm.userID)) {
    ElMessage.warning('用户 ID 只能包含字母、数字、下划线')
    return
  }
  if (!registerForm.nickname.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (registerForm.password.length < 6) {
    ElMessage.warning('密码至少 6 位')
    return
  }
  if (registerForm.password !== registerForm.confirmPwd) {
    ElMessage.error('两次密码不一致')
    return
  }

  isSubmitting.value = true
  try {
    // 检查是否已存在
    if (localStorage.getItem('mikechat_user_' + registerForm.userID)) {
      ElMessage.warning('该用户 ID 已被占用')
      return
    }

    // 本地存储用户数据（实际项目应调后端 API）
    localStorage.setItem(
      'mikechat_user_' + registerForm.userID,
      JSON.stringify({
        nickname: registerForm.nickname,
        password: registerForm.password,
        createdAt: Date.now(),
      })
    )

    // 同时更新昵称到全局状态
    localStorage.setItem('mikechat_username', JSON.stringify(registerForm.nickname))

    ElMessage.success(`✅ 注册成功！欢迎 ${registerForm.nickname}`)

    // 自动切换到登录并填入信息
    loginForm.userID = registerForm.userID
    loginForm.password = ''
    mode.value = 'login'

    // 清空注册表单
    registerForm.userID = ''
    registerForm.nickname = ''
    registerForm.password = ''
    registerForm.confirmPwd = ''
  } catch (e) {
    ElMessage.error('注册失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

/* ========== 快速登录 ========== */
async function quickLogin(userID: string) {
  loginForm.userID = userID
  isSubmitting.value = true
  try {
    await imLogin(userID)
    ElMessage.success(`✅ 以 ${userID} 身份登录`)
    router.push('/app/chat')
  } catch (e: any) {
    ElMessage.error(`快速登录失败: ${e.message}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* ================================================================
   Login / Register Page — v4.0 Deep Dark Glass
   ================================================================ */

.login-page {
  width: 100%; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, #090d16 0%, #0c1225 40%, #0a1020 70%, #0b0f1e 100%);
  position: relative; overflow: hidden;
}

/* 背景光斑 */
.bg-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
}
.orb-1 {
  width: 500px; height: 500px; top: -15%; right: -10%;
  background: radial-gradient(circle, rgba(99,102,241,0.07), transparent 68%);
  animation: floatOrb 14s ease-in-out infinite alternate;
}
.orb-2 {
  width: 350px; height: 350px; bottom: -12%; left: -8%;
  background: radial-gradient(circle, rgba(139,92,246,0.05), transparent 68%);
  animation: floatOrb 18s ease-in-out infinite alternate-reverse;
}
.orb-3 {
  width: 200px; height: 200px; top: 40%; left: 20%;
  background: radial-gradient(circle, rgba(34,197,94,0.03), transparent 68%);
  animation: floatOrb 22s ease-in-out infinite alternate;
}
@keyframes floatOrb {
  from { transform: translate(0, 0); }
  to   { transform: translate(25px, -30px); }
}

/* 容器 */
.login-container {
  width: 420px; max-width: 92vw;
  padding: 36px 32px;
  background: rgba(17, 24, 39, 0.65);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 26px;
  box-shadow:
    0 25px 80px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.04);
  z-index: 1;
  animation: containerIn 0.5s cubic-bezier(.34,1.56,.64,1);
}
@keyframes containerIn {
  from { opacity: 0; transform: scale(0.95) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Brand */
.brand-section { text-align: center; margin-bottom: 28px; }

.logo-circle {
  width: 56px; height: 56px;
  margin: 0 auto 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 28px rgba(99,102,241,0.35);
  position: relative;
}
.logo-circle::after {
  content: '';
  position: absolute; inset: -4px;
  border-radius: 22px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  filter: blur(14px); opacity: 0.45; z-index: -1;
}
.logo-letter {
  font-size: 26px; font-weight: 850;
  color: white; line-height: 1;
}

.brand-name {
  font-size: 26px; font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #fff, rgba(255,255,255,0.75));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  margin: 0 0 5px;
}
.brand-sub {
  font-size: 13px; color: rgba(255,255,255,0.38);
  margin: 0;
}

/* Tab Bar */
.tab-bar {
  display: flex; position: relative;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 4px; margin-bottom: 24px;
}
.tab-btn {
  flex: 1; padding: 9px 0;
  background: transparent; border: none; border-radius: 11px;
  font-size: 13px; font-weight: 650;
  color: rgba(255,255,255,0.45);
  cursor: pointer; transition: color 0.25s;
  z-index: 1; position: relative;
}
.tab-btn.active { color: white; }
.tab-indicator {
  position: absolute; top: 4px;
  height: calc(100% - 8px);
  width: calc(50% - 4px);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 11px;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 2px 10px rgba(99,102,248,0.3);
}
.tab-indicator.ind-login { left: 4px; }
.tab-indicator.ind-register { left: calc(50% + 0px); }

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-size: 12.5px; font-weight: 650;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.glass-input {
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  font-size: 14.5px; color: rgba(255,255,255,0.92);
  outline: none; transition: all 0.2s;
  font-family: inherit;
}
.glass-input:focus {
  border-color: rgba(129,140,248,0.5);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
}
.glass-input::placeholder { color: rgba(255,255,255,0.25); }

.pwd-wrap { position: relative; display: flex; align-items: center; }
.pwd-wrap .glass-input { padding-right: 44px; width: 100%; }
.eye-btn {
  position: absolute; right: 12px;
  background: none; border: none; cursor: pointer;
  font-size: 17px; line-height: 1; padding: 4px;
  transition: transform 0.2s;
}
.eye-btn:hover { transform: scale(1.15); }

.submit-btn {
  padding: 13px 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; border: none; border-radius: 13px;
  font-size: 15px; font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
  box-shadow: 0 6px 22px rgba(99,102,241,0.35);
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(99,102,241,0.48);
}
.submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.submit-btn--reg {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 6px 22px rgba(34,197,94,0.35);
}
.submit-btn--reg:hover:not(:disabled) {
  box-shadow: 0 8px 28px rgba(34,197,94,0.48);
}

.form-footer {
  text-align: center; font-size: 13px;
  color: rgba(255,255,255,0.4); margin: 0;
}
.link-accent {
  color: #818cf8; text-decoration: none;
  font-weight: 650; transition: color 0.2s;
}
.link-accent:hover { color: #a5b4fc; }

/* Quick Users */
.quick-users { margin-top: 22px; text-align: center; }
.quick-label {
  font-size: 11.5px; color: rgba(255,255,255,0.3);
  margin: 0 0 10px;
}
.quick-list { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.quick-user-btn {
  padding: 6px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  transition: all 0.2s;
}
.quick-user-btn:hover {
  background: rgba(99,102,241,0.12);
  border-color: rgba(99,102,241,0.25);
  color: #a5b4fc;
  transform: translateY(-1px);
}

/* Version */
.version-tag {
  text-align: center;
  font-size: 11px; color: rgba(255,255,255,0.2);
  margin: 22px 0 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container { padding: 28px 22px; border-radius: 20px; }
  .brand-name { font-size: 22px; }
  .logo-circle { width: 48px; height: 48px; border-radius: 15px; }
  .logo-letter { font-size: 22px; }
}
</style>
