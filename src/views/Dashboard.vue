<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="avatar-wrap-glass">
          <img :src="avatarUrl" alt="" class="welcome-avatar" />
          <span class="online-pulse"></span>
        </div>
        <div>
          <h1>你好，{{ displayName }} 👋</h1>
          <p>{{ greeting }} · {{ dateDisplay }}</p>
        </div>
      </div>
      <RouterLink to="/app/chat" class="action-btn">
        <span class="action-icon">💬</span>
        <span>开始聊天</span>
        <span class="action-arrow">→</span>
      </RouterLink>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="(stat, i) in statCards" :key="stat.key"
           class="stat-card" :class="[`stat--${i % 5}`, { 'stat--loading': isLoading }]">
        <div class="stat-icon-wrap">{{ stat.icon }}</div>
        <div class="stat-body">
          <div class="stat-value" :class="{ 'skeleton': isLoading }">
            {{ isLoading ? '...' : stat.value }}
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div v-if="stat.trend" class="stat-trend" :class="stat.trendClass || 'trend-neutral'"> {{ stat.trend }} </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="section">
      <h2 class="section-title"><span class="title-icon">⚡</span> 快捷操作</h2>
      <div class="quick-grid">
        <RouterLink to="/app/chat" class="quick-card glass-hover">
          <div class="q-icon q-icon--primary">💬</div>
          <div class="q-info"><h3>发起聊天</h3><p>进入聊天界面开始对话</p></div>
          <span class="q-arrow">→</span>
        </RouterLink>
        <RouterLink to="/app/settings" class="quick-card glass-hover">
          <div class="q-icon q-icon--neutral">⚙️</div>
          <div class="q-info"><h3>账号设置</h3><p>管理个人资料与偏好</p></div>
          <span class="q-arrow">→</span>
        </RouterLink>
        <div class="quick-card quick-card--static glass-hover">
          <div class="q-icon q-icon--warning">🔔</div>
          <div class="q-info"><h3>消息通知</h3><p>{{ notifStatus }}</p></div>
          <span :class="['q-tag', notifEnabled ? 'q-tag--active' : 'q-tag--off']">{{ notifEnabled ? '已开启' : '已关闭' }}</span>
        </div>
        <div class="quick-card quick-card--static glass-hover">
          <div class="q-icon q-icon--success">🔒</div>
          <div class="q-info"><h3>安全连接</h3><p>TLS 1.3 加密通道</p></div>
          <span class="q-tag q-tag--success">安全</span>
        </div>
      </div>
    </div>

    <!-- 账号信息 -->
    <div class="section">
      <h2 class="section-title"><span class="title-icon">📋</span> 账号信息</h2>
      <div class="info-table">
        <div v-for="row in infoRows" :key="row.label" class="info-row" :class="{ last: row.last }">
          <span class="info-label">{{ row.label }}</span>
          <span class="info-value" :class="row.valueClass">{{ row.value }}</span>
        </div>
      </div>
    </div>

    <!-- 连接状态 -->
    <div class="section section--last">
      <h2 class="section-title"><span class="title-icon">🕐</span> 系统状态</h2>
      <div class="activity-list">
        <div class="activity-item">
          <div class="a-dot a-dot--ok"></div>
          <div class="a-content">
            <div class="a-title">IM 服务连接</div>
            <div class="a-desc">Tencent Cloud IM · AppID: {{ sdkID }}</div>
          </div>
          <span class="a-status a-status--ok">{{ isLoggedIn ? '在线' : '离线' }}</span>
        </div>
        <div class="activity-item">
          <div class="a-dot" :class="isLoggedIn ? 'a-dot--ok' : ''"></div>
          <div class="a-content">
            <div class="a-title">当前用户</div>
            <div class="a-desc">{{ currentUserID || '未登录' }}</div>
          </div>
          <span class="a-status" :class="isLoggedIn ? 'a-status--ok' : 'a-status--off'">{{ isLoggedIn ? '活跃' : '待机' }}</span>
        </div>
        <div class="activity-item activity-item--last">
          <div class="a-dot a-dot--info"></div>
          <div class="a-content">
            <div class="a-title">应用版本</div>
            <div class="a-desc">MikeChat v5.0 Ultimate</div>
          </div>
          <span class="a-status a-status--info">v5.0</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useIMLogin } from '../composables/useIMLogin'
import { notifications } from '../composables/useAppStore'

const { isLoggedIn, currentUserID, SDKAppID } = useIMLogin()

const displayName = computed(() => currentUserID.value || '访客')
const avatarUrl = computed(() =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserID.value || 'default'}&backgroundColor=1e293b`
)
const sdkID = String(SDKAppID)

const notifEnabled = computed(() => notifications.message)
const notifStatus = computed(() =>
  notifications.message ? '桌面推送已开启' : '桌面推送未开启'
)

const now = new Date()
const hour = now.getHours()
const greeting = computed(() => {
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const dateDisplay = computed(() => {
  const d = new Date()
  const w = ['日','一','二','三','四','五','六']
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${w[d.getDay()]}`
})

const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 700))

const statCards = computed(() => [
  { key: 'conv', icon: '💬', label: '会话数', value: isLoggedIn.value ? '1+' : '0', trend: '', trendClass: '' },
  { key: 'contact', icon: '👥', label: '联系人', value: isLoggedIn.value ? '4' : '0', trend: '+2', trendClass: 'trend-up' },
  { key: 'unread', icon: '✉️',  label: '未读消息', value: '0', trend: '', trendClass: '' },
  { key: 'status', icon: isLoggedIn.value ? '🟢' : '🔴', label: '连接状态', value: isLoggedIn.value ? '在线' : '离线', trend: '', trendClass: '' },
])

const infoRows = computed(() => [
  { label: '用户 ID', value: currentUserID.value || '未登录', valueClass: 'mono' },
  { label: 'IM 引擎', value: 'Tencent Cloud IM', valueClass: '' },
  { label: 'SDK AppID', value: sdkID, valueClass: 'mono' },
  { label: '安全协议', value: 'TLS 1.3 / WSS', valueClass: '', last: true },
])
</script>

<style scoped>
/* ===================================================
   Dashboard — v5.0 Ultimate Dark Glass Edition
   =================================================== */

.dashboard-page {
  width: 100%; height: 100%;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 20px;
  padding-bottom: 14px;
}
.dashboard-page::-webkit-scrollbar { width: 5px; }
.dashboard-page::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 3px; }

/* ===== Welcome Banner ===== */
.welcome-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 26px 30px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 25%, #7c3aed 50%, #9333ea 75%, #a855f7 100%);
  border-radius: 20px;
  color: white; position: relative; overflow: hidden;
  animation: bannerInV5 0.55s cubic-bezier(.22,1,.36,1);
}
@keyframes bannerInV5 {
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.welcome-banner::before {
  content: ''; position: absolute; top: -40%; right: -12%;
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.welcome-banner::after {
  content: ''; position: absolute; bottom: -28%; left: 22%;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}

.welcome-left {
  display: flex; align-items: center; gap: 17px;
  min-width: 0; z-index: 1; position: relative;
}

.avatar-wrap-glass { position: relative; flex-shrink: 0; }

.welcome-avatar {
  width: 58px; height: 58px; border-radius: 16px;
  border: 2.5px solid rgba(255,255,255,0.28);
  background: rgba(255,255,255,0.1);
  object-fit: cover; display: block;
  box-shadow: 0 4px 18px rgba(0,0,0,0.22);
}

.online-pulse {
  position: absolute; bottom: 2px; right: 2px;
  width: 13px; height: 13px; background: #22c55e;
  border-radius: 50%; border: 2.5px solid rgba(14,20,36,0.75);
  box-shadow: 0 0 8px rgba(34,197,94,0.52);
  animation: pulseGlowV5 2s infinite;
}
@keyframes pulseGlowV5 {
  0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.5); }
  50% { box-shadow: 0 0 14px rgba(34,197,94,0.82); }
}

.welcome-left h1 { font-size: 21px; font-weight: 780; margin: 0 0 4px; letter-spacing: -0.02em; }
.welcome-left p { font-size: 13px; margin: 0; opacity: 0.85; font-weight: 400; }

.action-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 23px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.26);
  border-radius: 15px;
  color: white; text-decoration: none;
  font-size: 14px; font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
  white-space: nowrap;
  z-index: 1; position: relative;
}
.action-btn:hover {
  background: rgba(255,255,255,0.26);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
}
.action-icon { font-size: 17px; }
.action-arrow { font-size: 16px; opacity: 0.7; }

/* ===== Stats Grid ===== */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; }

.stat-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 17px;
  background: rgba(14, 20, 36,0.55);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 17px;
  transition: all 0.32s cubic-bezier(0.25,0.46,0.45,0.94);
  position: relative; overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(0,0,0,0.28);
  border-color: rgba(99,102,241,0.18);
}

.stat--0 { --sc-accent: rgba(99,102,241,0.12); --sc-border: rgba(99,102,241,0.2); }
.stat--1 { --sc-accent: rgba(59,130,246,0.12);   --sc-border: rgba(59,130,246,0.2); }
.stat--2 { --sc-accent: rgba(34,197,94,0.12);   --sc-border: rgba(34,197,94,0.2); }
.stat--3 { --sc-accent: rgba(245,158,11,0.12);  --sc-border: rgba(245,158,11,0.2); }
.stat--4 { --sc-accent: rgba(168,85,247,0.12);  --sc-border: rgba(168,85,247,0.2); }

.stat-icon-wrap {
  width: 46px; height: 46px; min-width: 46px;
  border-radius: 14px;
  background: var(--sc-accent);
  border: 1px solid var(--sc-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 21px; line-height: 1;
}
.stat-body { min-width: 0; }
.stat-value {
  font-size: 22px; font-weight: 800;
  color: rgba(255,255,255,0.93); line-height: 1.2;
}
.skeleton {
  display: inline-block; min-width: 42px; height: 24px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%; animation: shimmerV5 1.6s infinite;
  border-radius: 7px;
}
@keyframes shimmerV5 {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.stat-label { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; font-weight: 550; }

.stat-trend {
  margin-left: auto; font-size: 11.5px; font-weight: 700;
  padding: 3px 9px; border-radius: 8px; white-space: nowrap;
}
.trend-up { color: #4ade80; background: rgba(34,197,94,0.1); }
.trend-neutral { color: rgba(148,163,184,0.5); background: rgba(148,163,184,0.08); }

/* ===== Section ===== */
.section { display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
.section--last { padding-bottom: 10px; }

.section-title {
  font-size: 14px; font-weight: 700;
  color: rgba(255,255,255,0.82); margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex; align-items: center; gap: 8px;
}
.title-icon { font-size: 15px; }

/* ===== Quick Grid ===== */
.quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

.quick-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  background: rgba(14, 20, 36,0.42);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  text-decoration: none; color: inherit;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.25,0.46,0.45,0.94);
  position: relative; overflow: hidden;
}
.quick-card:hover {
  border-color: rgba(99,102,241,0.22);
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
  transform: translateY(-2.5px);
  background: rgba(14, 20, 36,0.58);
}
.quick-card--static { cursor: default; }

.q-icon {
  width: 44px; height: 44px; min-width: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px;
}
.q-icon--primary { background: rgba(99,102,241,0.12); }
.q-icon--neutral  { background: rgba(107,114,128,0.12); }
.q-icon--warning  { background: rgba(245,158,11,0.12); }
.q-icon--success  { background: rgba(34,197,94,0.12); }

.q-info { flex: 1; min-width: 0; }
.q-info h3 { font-size: 14px; font-weight: 650; color: rgba(255,255,255,0.88); margin: 0 0 3px; }
.q-info p  { font-size: 12px; color: rgba(255,255,255,0.33); margin: 0; }

.q-arrow { font-size: 16px; color: rgba(255,255,255,0.22); flex-shrink: 0; }

.q-tag {
  padding: 4px 11px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
  white-space: nowrap; flex-shrink: 0;
}
.q-tag--active { background: rgba(245,158,11,0.1); color: #fbbf24; }
.q-tag--off { background: rgba(107,114,128,0.1); color: rgba(148,163,184,0.55); }
.q-tag--success { background: rgba(34,197,94,0.1); color: #4ade80; }

/* ===== Info Table ===== */
.info-table {
  background: rgba(14, 20, 36,0.42);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
}

.info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.038);
  transition: background 0.15s;
}
.info-row:hover { background: rgba(99,102,241,0.04); }
.info-row.last { border-bottom: none !important; }

.info-label { font-size: 13px; color: rgba(255,255,255,0.38); font-weight: 550; }
.info-value { font-size: 13px; font-weight: 620; color: rgba(255,255,255,0.82); }
.mono { font-family: 'SF Mono', ui-monospace, monospace; font-size: 12px; }

/* ===== Activity List ===== */
.activity-list { display: flex; flex-direction: column; gap: 3px; }

.activity-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: 13px;
  transition: background 0.2s;
  background: rgba(14, 20, 36,0.35);
  margin-bottom: 3px;
}
.activity-item:hover { background: rgba(99,102,241,0.06); }
.activity-item--last { margin-bottom: 0; }

.a-dot {
  width: 10px; height: 10px; min-width: 10px;
  border-radius: 50%; background: rgba(148,163,184,0.25);
}
.a-dot--ok { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.38); }
.a-dot--info { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.3); }

.a-content { flex: 1; min-width: 0; }
.a-title { font-size: 14px; font-weight: 620; color: rgba(255,255,255,0.88); }
.a-desc { font-size: 12px; color: rgba(255,255,255,0.33); margin-top: 2px; }

.a-status {
  padding: 4px 11px; border-radius: 9px;
  font-size: 11px; font-weight: 700;
  white-space: nowrap; flex-shrink: 0;
}
.a-status--ok { background: rgba(34,197,94,0.1); color: #4ade80; }
.a-status--off { background: rgba(107,114,128,0.1); color: rgba(148,163,184,0.55); }
.a-status--info { background: rgba(59,130,246,0.1); color: #60a5fa; }

/* ===== Responsive ===== */
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) {
  .welcome-banner { flex-wrap: wrap; padding: 20px 22px; }
  .action-btn { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: 1fr; }
}
</style>
