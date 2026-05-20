// 控制总线：跨页面广播指令日志、告警、E-Stop 联锁
// 用纯发布订阅 + 全局数组实现，避免引入额外状态库
// 与现有 mock 风格一致（mock/data.ts 暴露同等结构对象）

import { controlLogs, type ControlLogEntry, alarms } from '../../mock/data'

type Listener = () => void
const listeners = new Set<Listener>()

let estopActive = false

function notify() {
  listeners.forEach(l => l())
}

export function subscribe(l: Listener): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export function getControlLogs(): ControlLogEntry[] {
  return controlLogs
}

export function pushControlLog(entry: Omit<ControlLogEntry, 'id' | 'time'> & { time?: string }) {
  const now = new Date()
  const time = entry.time ?? now.toLocaleTimeString('zh-CN', { hour12: false })
  const id = `CTL-${String(controlLogs.length + 1).padStart(3, '0')}`
  controlLogs.unshift({ id, time, ...entry })
  if (controlLogs.length > 50) controlLogs.pop()
  notify()
}

export interface AlarmShape {
  id: string
  level: 'critical' | 'warning' | 'info'
  device: string
  message: string
  action: string
  status: 'resolved' | 'pending' | 'acknowledged'
  time: string
  handled: boolean
}

export function pushAlarm(a: Omit<AlarmShape, 'id' | 'time' | 'handled'> & { time?: string }) {
  const id = `ALM-${String(alarms.length + 1).padStart(3, '0')}`
  const time = a.time ?? '刚刚'
  ;(alarms as AlarmShape[]).unshift({
    id, time, handled: false,
    ...a,
  })
  if (alarms.length > 30) alarms.pop()
  notify()
}

export function isEstopActive(): boolean {
  return estopActive
}

export function triggerEstop(user = '操作员') {
  if (estopActive) return
  estopActive = true
  pushControlLog({
    user, device: '全系统', action: '紧急停车 E-Stop',
    before: '运行', after: '联锁'
  })
  pushAlarm({
    level: 'critical',
    device: '全系统',
    message: '紧急停车 E-Stop 触发，所有 MFC=0，阀门关闭',
    action: '已自动联锁',
    status: 'pending',
  })
  notify()
}

export function releaseEstop(user = '操作员') {
  if (!estopActive) return
  estopActive = false
  pushControlLog({
    user, device: '全系统', action: '解除联锁',
    before: '联锁', after: '待机'
  })
  notify()
}
