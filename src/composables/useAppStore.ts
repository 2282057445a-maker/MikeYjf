// src/composables/useAppStore.ts
// 全局应用状态：持久化设置 + Toast通知

import { ref, reactive } from 'vue'

// ===== 持久化存储键 =====
const STORAGE_KEYS = {
  USERNAME: 'mikechat_username',
  SIGNATURE: 'mikechat_signature',
  THEME: 'mikechat_theme',
  NOTIFICATIONS: 'mikechat_notif',
  PRIVACY: 'mikechat_privacy',
  SIDEBAR_COLLAPSED: 'mikechat_sidebar',
}

// ===== 简易持久化读写 =====
function readJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T ?? fallback }
  catch { return fallback }
}
function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch (e) { console.warn('存储写入失败:', e) }
}

// ===== 用户偏好（持久化） =====
export const username = ref(readJSON(STORAGE_KEYS.USERNAME, ''))
export const signature = ref(readJSON(STORAGE_KEYS.SIGNATURE, '这个人很懒，什么都没写~'))
export const themeColor = ref<string>(readJSON(STORAGE_KEYS.THEME, 'purple-blue')) // purple-blue | cyan | orange-red
export const sidebarCollapsed = ref(readJSON(STORAGE_KEYS.SIDEBAR_COLLAPSED, false))

export const notifications = reactive<Record<string, boolean>>(
  readJSON(STORAGE_KEYS.NOTIFICATIONS, { message: true, sound: true, desktop: false })
)
export const privacy = reactive<Record<string, boolean>>(
  readJSON(STORAGE_KEYS.PRIVACY, { showOnline: true, readReceipt: true, friendVerification: true })
)

// ===== 保存函数 =====
export function saveUsername(val: string): void { username.value = val; writeJSON(STORAGE_KEYS.USERNAME, val) }
export function saveSignature(val: string): void { signature.value = val; writeJSON(STORAGE_KEYS.SIGNATURE, val) }
export function setThemeColor(val: string): void { themeColor.value = val; writeJSON(STORAGE_KEYS.THEME, val) }
export function toggleSidebar(): void { sidebarCollapsed.value = !sidebarCollapsed.value; writeJSON(STORAGE_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed.value) }

// 保存整个对象
export function saveNotifications(): void { writeJSON(STORAGE_KEYS.NOTIFICATIONS, { ...notifications }) }
export function savePrivacy(): void { writeJSON(STORAGE_KEYS.PRIVACY, { ...privacy }) }

// ===== 主题色映射 =====
export const themeColors: Record<string, { primary: string; secondary: string; name: string }> = {
  'purple-blue':  { primary: '#667eea', secondary: '#764ba2', name: '紫蓝渐变' },
  'cyan':        { primary: '#06b6d4', secondary: '#3b82f6', name: '青蓝' },
  'orange-red':  { primary: '#f59e0b', secondary: '#ef4444', name: '橙红' },
  'emerald':     { primary: '#10b981', secondary: '#06b6d4', name: '翠绿' },
  'rose':        { primary: '#f43f5e', secondary: '#8b5cf6', name: '玫紫' },
}

// ===== 获取当前主题CSS变量 =====
export function getThemeVars() {
  const t = themeColors[themeColor.value] || themeColors['purple-blue']
  return {
    '--mc-primary': t.primary,
    '--mc-secondary': t.secondary,
    '--mc-gradient': `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`,
    '--mc-glow': `0 8px 24px rgba(${hexToRgb(t.primary)}, 0.35)`,
  }
}
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
