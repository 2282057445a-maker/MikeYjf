<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- ===== 侧边栏 (Deep Dark Glass) ===== -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- 品牌区 -->
      <div class="brand">
        <div class="brand-logo">
          <span class="logo-glow"></span>
          <span class="logo-icon">M</span>
        </div>
        <Transition name="fade-slide">
          <span v-show="!sidebarCollapsed" class="brand-text">MikeChat</span>
        </Transition>
      </div>

      <!-- 导航 -->
      <nav class="nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :title="item.label"
        >
          <div class="nav-icon-wrap">
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          </div>
          <Transition name="fade-slide">
            <span v-show="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
          </Transition>
        </RouterLink>
      </nav>

      <!-- 折叠按钮 -->
      <button @click="toggleSidebar" class="collapse-btn" :title="sidebarCollapsed ? '展开' : '折叠'">
        <span class="collapse-icon" :class="{ rotated: !sidebarCollapsed }">›</span>
      </button>

      <!-- 底部版本 -->
      <div class="sidebar-footer">
        <Transition name="fade-slide">
          <span v-show="!sidebarCollapsed" class="muted">v5.1 · Ultimate</span>
        </Transition>
      </div>
    </aside>

    <!-- ===== 右侧内容区 ===== -->
    <main class="content">
      <!-- Topbar (非全屏模式) -->
      <Transition name="topbar-fade">
        <header v-if="!isFullscreen" class="topbar">
          <div class="topbar-left">
            <h1 class="page-title">{{ title }}</h1>
            <span class="page-subtitle">{{ route.path }}</span>
          </div>
          <div class="topbar-right">
            <!-- 连接状态指示 -->
            <div class="status-indicator" :class="{ online: isLoggedIn }">
              <span class="status-dot"></span>
              <span class="status-text">{{ isLoggedIn ? '已连接' : '未连接' }}</span>
            </div>
            <!-- 当前用户 (如果登录了) -->
            <div v-if="currentUserID" class="user-chip">
              <img :src="avatarUrl" alt="" class="user-avatar-xs" />
              <span>{{ currentUserID }}</span>
            </div>
          </div>
        </header>
      </Transition>

      <!-- 页面内容区 -->
      <section class="page" :class="{ 'page--full': isFullscreen }">
        <!-- 非全屏页面（Dashboard/Settings）用卡片包裹 -->
        <div v-if="!isFullscreen" class="card">
          <RouterView v-slot="{ Component, route: r }">
            <Transition name="page-transition" mode="out-in">
              <component :is="Component" :key="r.path" />
            </Transition>
          </RouterView>
        </div>
        <!-- 全屏页面（Chat）直接渲染，无额外包裹 -->
        <RouterView v-else />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useIMLogin } from '../composables/useIMLogin'
import { sidebarCollapsed, toggleSidebar } from '../composables/useAppStore'

const route = useRoute()
const { isLoggedIn, currentUserID } = useIMLogin()

const title = computed(() => (route.meta.title as string) || 'App')
const isFullscreen = computed(() => !!route.meta.fullscreen)

const avatarUrl = computed(() =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserID.value || 'default'}`
)

const navItems: { path: string; icon: string; label: string; badge?: string }[] = [
  { path: '/app/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/app/chat', icon: '💬', label: 'Chat' },
  { path: '/app/settings', icon: '⚙️', label: 'Settings' },
]
</script>

<style scoped>
/* ===================================================
   Deep Dark Glassmorphism Theme Variables
   强制深色，不依赖系统偏好
   =================================================== */
.app-shell {
  --mc-bg: #090d16;
  --mc-panel: rgba(17, 24, 39, 0.72);
  --mc-card: rgba(17, 24, 39, 0.65);
  --mc-border: rgba(255, 255, 255, 0.06);
  --mc-text: rgba(255, 255, 255, 0.92);
  --mc-muted: rgba(255, 255, 255, 0.4);
  --mc-side-bg: linear-gradient(170deg, #0a0e1a 0%, #111827 40%, #1a103c 100%);
  --mc-side-border: rgba(255, 255, 255, 0.05);
  --mc-side-text: rgba(255, 255, 255, 0.88);
  --mc-side-muted: rgba(255, 255, 255, 0.38);
  --mc-side-hover: rgba(255, 255, 255, 0.07);
  --mc-radius-xl: 20px;
  --mc-radius-lg: 16px;
  --mc-radius-md: 12px;
  --mc-radius-sm: 10px;

  height: 100vh;
  width: 100%;
  display: flex;
  overflow: hidden;
  background: var(--mc-bg);
  color: var(--mc-text);
}

/* ===================================================
   SIDEBAR - Deep Dark Glass
   =================================================== */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--mc-side-bg);
  border-right: 1px solid var(--mc-side-border);
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
  z-index: 100;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 背景光斑 */
.sidebar::before {
  content: '';
  position: absolute;
  top: -60px; right: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 68px;
  padding: 14px 8px;
}

/* ===== Brand ===== */
.brand {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px;
  border-radius: var(--mc-radius-md);
  user-select: none;
  flex-shrink: 0;
}

.brand-logo {
  width: 36px; height: 36px; min-width: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}

.logo-glow {
  position: absolute; inset: -3px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  filter: blur(10px); opacity: 0.45;
  z-index: -1;
}

.logo-icon {
  font-size: 18px; font-weight: 800;
  color: white; line-height: 1;
}

.brand-text {
  font-weight: 750;
  font-size: 17px;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  white-space: nowrap;
}

/* ===== Nav ===== */
.nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px;
  border-radius: var(--mc-radius-lg);
  background: rgba(255, 255, 255, 0.02);
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 13px;
  border-radius: var(--mc-radius-md);
  color: var(--mc-side-text);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(34, 197, 94, 0.08));
  transition: opacity 0.25s;
}

.nav-item:hover { color: #fff; }
.nav-item:hover::before { opacity: 1; }

.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  color: #fff;
}
.nav-item.router-link-active::before,
.nav-item.router-link-exact-active::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.28), rgba(34, 197, 94, 0.12));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25);
}

.nav-icon-wrap {
  position: relative;
  min-width: 24px;
  text-align: center;
}

.nav-icon {
  font-size: 19px;
  line-height: 1;
}

.nav-badge {
  position: absolute;
  top: -2px; right: -4px;
  min-width: 16px; height: 16px;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  background: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center; justify-content: center;
  line-height: 1;
}

.nav-text {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.15px;
}

/* ===== Collapse Button ===== */
.collapse-btn {
  align-self: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid var(--mc-side-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--mc-side-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s;
  margin-top: auto;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: scale(1.08);
}

.collapse-icon {
  font-size: 18px;
  font-weight: 300;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}
.collapse-icon.rotated { transform: rotate(90deg); }

/* ===== Footer ===== */
.sidebar-footer {
  padding: 4px 8px;
  flex-shrink: 0;
}
.muted {
  font-size: 11px;
  color: var(--mc-side-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===================================================
   CONTENT AREA
   =================================================== */
.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
}

/* ===== Topbar - Dark Glass Bar ===== */
.topbar {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--mc-panel);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid var(--mc-border);
  z-index: 50;
}

.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 19px;
  font-weight: 750;
  margin: 0;
  letter-spacing: -0.02em;
  color: rgba(255,255,255,0.93);
}

.page-subtitle {
  font-size: 12px;
  color: var(--mc-muted);
  font-weight: 500;
  font-family: 'SF Mono', ui-monospace, monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 连接状态 */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 18px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.12);
  transition: all 0.25s;
}

.status-indicator.online {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.15);
}

.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.25s;
}

.status-indicator.online .status-dot {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.55);
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(148,163,184,0.6);
}

.status-indicator.online .status-text { color: #4ade80; }

/* User Chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px 4px 4px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--mc-border);
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.82);
}

.user-avatar-xs {
  width: 24px; height: 24px;
  border-radius: 8px;
  object-fit: cover;
}

/* ===== Page Section ===== */
.page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.page--full {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== Card (Dashboard / Settings) - Dark Glass ===== */
.card {
  min-height: 100%;
  background: var(--mc-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--mc-border);
  border-radius: var(--mc-radius-xl);
  padding: 28px;
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255,255,255,0.03);
  box-sizing: border-box;
  animation: cardEnter 0.4s ease-out;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===================================================
   TRANSITIONS
   =================================================== */

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-transition-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.topbar-fade-enter-active,
.topbar-fade-leave-active { transition: all 0.3s ease; }
.topbar-fade-enter-from,
.topbar-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ===== Scrollbar ===== */
.page::-webkit-scrollbar { width: 5px; }
.page::-webkit-scrollbar-track { background: transparent; }
.page::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 3px; }
.page::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.4); }

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .sidebar { width: 220px; }
  .sidebar.collapsed { width: 56px; }
  .card { padding: 20px; border-radius: var(--mc-radius-lg); }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0; top: 0; bottom: 0;
    z-index: 200;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
    transform: translateX(-100%);
  }
  .sidebar:not(.collapsed) { transform: translateX(0); }
  .sidebar.collapsed { transform: translateX(-100%); }

  .topbar { height: 54px; padding: 0 14px; }
  .page-title { font-size: 17px; }
  .card { padding: 16px; border-radius: var(--mc-radius-md); }
}
</style>
