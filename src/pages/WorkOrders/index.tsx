import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Drawer, Steps, Tag, Button, Progress, Tooltip, Badge, Space, Spin
} from 'antd'
import {
  ClockCircleOutlined, PlayCircleOutlined, ExperimentOutlined,
  CheckCircleOutlined, FileTextOutlined, StopOutlined, ReloadOutlined,
  UserOutlined, RobotOutlined, WarningOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { workOrders } from '../../mock/data'

// ── 样式常量 ──────────────────────────────────────────
const BG = '#080c18'
const CARD = 'rgba(255,255,255,0.04)'
const BORDER = 'rgba(255,255,255,0.08)'
const CYAN = '#00d4ff'
const GREEN = '#00ff88'
const WARN = '#ffb800'
const DANGER = '#ff4757'
const PURPLE = '#7b61ff'
const TEXT = '#e8f4ff'
const MUTED = '#6b8aad'

const cardStyle: React.CSSProperties = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: '12px',
  backdropFilter: 'blur(12px)',
  cursor: 'pointer',
  width: 200,
  flexShrink: 0,
  transition: 'all 0.2s',
}

// ── 工单列定义 ──────────────────────────────────────────
type WOStatus = 'review' | 'pending' | 'running' | 'analyzing' | 'completed'

const COLUMNS: { key: WOStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { key: 'review', label: '待审核', color: WARN, icon: <ClockCircleOutlined /> },
  { key: 'pending', label: '调度中', color: PURPLE, icon: <PlayCircleOutlined /> },
  { key: 'running', label: '执行中', color: CYAN, icon: <ExperimentOutlined /> },
  { key: 'analyzing', label: '分析中', color: '#00e5ff', icon: <FileTextOutlined /> },
  { key: 'completed', label: '已完成', color: GREEN, icon: <CheckCircleOutlined /> },
]

const STAT_MAP: Record<WOStatus, number> = {
  review: 4, pending: 2, running: 8, analyzing: 5, completed: 28
}

// ── 优先级标签 ──────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    ai: { color: PURPLE, bg: `${PURPLE}25`, label: 'AI推荐' },
    normal: { color: CYAN, bg: `${CYAN}20`, label: '人工' },
    urgent: { color: DANGER, bg: `${DANGER}25`, label: '紧急' },
  }
  const s = map[priority] ?? map.normal
  return (
    <span style={{
      fontSize: 9, padding: '2px 6px', borderRadius: 10,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}50`,
      fontWeight: 600, letterSpacing: 0.5,
    }}>
      {priority === 'ai' && '🤖 '}{s.label}
    </span>
  )
}

// ── 实时温度组件 ──────────────────────────────────────────
function LiveTemp({ base }: { base: number }) {
  const [temp, setTemp] = useState(base)
  useEffect(() => {
    const id = setInterval(() => {
      setTemp(t => +(t + (Math.random() - 0.5)).toFixed(1))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: WARN, fontSize: 11 }}>
      {temp.toFixed(1)}°C
    </span>
  )
}

// ── 滚动日志 ──────────────────────────────────────────
const MOCK_LOGS = [
  { time: '10:42:01', msg: '进料泵启动，MAO 预配比完成', level: 'info' },
  { time: '10:42:15', msg: '反应釜 R-12 温度爬升中 → 38.2°C', level: 'info' },
  { time: '10:43:00', msg: '催化剂注入完成，计量 0.42 μmol', level: 'info' },
  { time: '10:44:12', msg: '温度达到目标 65°C，开始计时', level: 'success' },
  { time: '10:45:30', msg: '压力稳定 0.61 MPa，持续监控', level: 'info' },
  { time: '10:46:00', msg: '取样泵 T+10min 执行', level: 'info' },
  { time: '10:47:18', msg: '[警告] 转速轻微波动 ±12 RPM，已自动补偿', level: 'warn' },
  { time: '10:48:00', msg: '取样 #2 完成，送 GPC', level: 'success' },
]

function LogPanel() {
  const [logs, setLogs] = useState(MOCK_LOGS.slice(0, 5))
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const id = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, MOCK_LOGS[prev.length % MOCK_LOGS.length]]
        if (ref.current) setTimeout(() => { ref.current!.scrollTop = ref.current!.scrollHeight }, 50)
        return next
      })
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const levelColor: Record<string, string> = { info: MUTED, success: GREEN, warn: WARN, error: DANGER }

  return (
    <div ref={ref} style={{
      height: 160, overflowY: 'auto', background: 'rgba(0,0,0,0.3)',
      borderRadius: 8, padding: '8px 10px',
      border: `1px solid ${BORDER}`,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
      scrollBehavior: 'smooth',
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: MUTED, flexShrink: 0 }}>{log.time}</span>
          <span style={{ color: levelColor[log.level] ?? MUTED }}>{log.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ── 工单卡片 ──────────────────────────────────────────
interface WO {
  id: string
  name: string
  catalyst: string
  reactor: string | null
  status: WOStatus
  priority: string
  duration: number
  progress: number
  operator: string
  activity: number | null
  pdi: number | null
}

interface WOCardProps {
  wo: WO
  onClick: (wo: WO) => void
}

function WOCard({ wo, onClick }: WOCardProps) {
  const [hovered, setHovered] = useState(false)
  const col = COLUMNS.find(c => c.key === wo.status)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => onClick(wo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        borderColor: hovered ? `${col?.color ?? CYAN}50` : BORDER,
        boxShadow: hovered ? `0 0 16px ${col?.color ?? CYAN}20` : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* 顶部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: MUTED, fontSize: 9 }}>{wo.id}</span>
        <PriorityBadge priority={wo.priority} />
      </div>

      {/* 名称 */}
      <div style={{ color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{wo.name}</div>

      {/* 催化剂 */}
      <div style={{ color: CYAN, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{wo.catalyst}</div>

      {/* 设备 */}
      {wo.reactor && (
        <div style={{ color: MUTED, fontSize: 10, marginBottom: 6 }}>
          <ExperimentOutlined style={{ marginRight: 4 }} />{wo.reactor}
        </div>
      )}

      {/* 操作员 */}
      <div style={{ color: MUTED, fontSize: 10, marginBottom: 6 }}>
        <UserOutlined style={{ marginRight: 4 }} />{wo.operator}
      </div>

      {/* 执行中：进度条 + 实时温度 */}
      {wo.status === 'running' && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: MUTED, fontSize: 10 }}>进度 {wo.progress}%</span>
            <LiveTemp base={74} />
          </div>
          <Progress
            percent={wo.progress}
            strokeColor={{ from: CYAN, to: GREEN }}
            trailColor="rgba(255,255,255,0.08)"
            size="small"
            showInfo={false}
          />
        </div>
      )}

      {/* 分析中：Loading */}
      {wo.status === 'analyzing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: CYAN, fontSize: 10 }}>
          <Spin size="small" />
          <span>GPC 解析中...</span>
        </div>
      )}

      {/* 已完成：结果 */}
      {wo.status === 'completed' && wo.activity && (
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <div style={{ background: `${CYAN}15`, borderRadius: 6, padding: '3px 6px' }}>
            <div style={{ fontSize: 9, color: MUTED }}>活性</div>
            <div style={{ fontSize: 11, color: CYAN, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {wo.activity.toLocaleString()}
            </div>
          </div>
          <div style={{ background: `${PURPLE}15`, borderRadius: 6, padding: '3px 6px' }}>
            <div style={{ fontSize: 9, color: MUTED }}>PDI</div>
            <div style={{ fontSize: 11, color: PURPLE, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {wo.pdi}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── 工单详情 Drawer ──────────────────────────────────────────
function WODrawer({ wo, open, onClose }: { wo: WO | null; open: boolean; onClose: () => void }) {
  if (!wo) return null

  const sopSteps = [
    { title: '安全检查', description: '手套、通风柜确认' },
    { title: '设备预热', description: '反应釜升温至目标温度' },
    { title: 'MAO 配制', description: 'Al/Zr=850 MAO 溶液' },
    { title: '进料', description: '乙烯/共单体通入' },
    { title: '催化剂注射', description: 'Cp₂ZrCl₂ 注射' },
    { title: '聚合反应', description: '90 min 保温聚合' },
    { title: '终止/后处理', description: 'HCl 乙醇终止' },
    { title: '产物分析', description: 'GPC/DSC 测试' },
  ]

  const params = [
    { label: '聚合温度', value: '65 °C' },
    { label: '聚合压力', value: '0.6 MPa' },
    { label: 'Al/Zr 比', value: '850' },
    { label: '反应时长', value: '90 min' },
    { label: '共单体', value: '1-己烯' },
    { label: '共单体比', value: '0.15' },
    { label: '催化剂用量', value: '0.42 μmol' },
    { label: '溶剂', value: '甲苯 50 mL' },
  ]

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: CYAN, fontSize: 13 }}>{wo.id}</span>
          <PriorityBadge priority={wo.priority} />
        </div>
      }
      open={open}
      onClose={onClose}
      width={500}
      placement="right"
      styles={{
        body: { background: '#0a1220', padding: '16px 20px' },
        header: { background: '#0a1220', borderBottom: `1px solid ${BORDER}` },
        wrapper: { background: 'transparent' },
        mask: { background: 'rgba(0,0,0,0.6)' },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 工单名 */}
        <div>
          <div style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{wo.name}</div>
          <div style={{ color: MUTED, fontSize: 12 }}>催化剂: {wo.catalyst} | 设备: {wo.reactor ?? '未分配'}</div>
        </div>

        {/* 配方参数表 */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, color: TEXT, fontSize: 12, fontWeight: 600 }}>完整配方参数</div>
          <div style={{ padding: '10px 14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {params.map(({ label, value }) => (
                  <tr key={label}>
                    <td style={{ color: MUTED, fontSize: 12, padding: '4px 0', width: '50%' }}>{label}</td>
                    <td style={{ color: TEXT, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SOP 步骤 */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px' }}>
          <div style={{ color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>SOP 执行进度</div>
          <Steps
            direction="vertical"
            size="small"
            current={5}
            style={{ color: TEXT }}
            items={sopSteps.map((s, i) => ({
              title: <span style={{ color: i <= 5 ? TEXT : MUTED, fontSize: 12 }}>{s.title}</span>,
              description: <span style={{ color: MUTED, fontSize: 10 }}>{s.description}</span>,
              status: i < 5 ? 'finish' : i === 5 ? 'process' : 'wait',
              icon: i < 5
                ? <CheckCircleOutlined style={{ color: GREEN }} />
                : i === 5
                  ? <PlayCircleOutlined style={{ color: CYAN }} />
                  : undefined,
            }))}
          />
        </div>

        {/* 实时日志 */}
        <div>
          <div style={{ color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>实时执行日志</div>
          <LogPanel />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            icon={<StopOutlined />}
            style={{ flex: 1, background: `${DANGER}15`, border: `1px solid ${DANGER}50`, color: DANGER, borderRadius: 8 }}
          >
            终止
          </Button>
          <Button
            icon={<ReloadOutlined />}
            style={{ flex: 1, background: `${WARN}15`, border: `1px solid ${WARN}50`, color: WARN, borderRadius: 8 }}
          >
            重试
          </Button>
          <Button
            icon={<UserOutlined />}
            style={{ flex: 1, background: `${PURPLE}15`, border: `1px solid ${PURPLE}50`, color: PURPLE, borderRadius: 8 }}
          >
            人工接管
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

// ── 主页面 ──────────────────────────────────────────
export default function WorkOrders() {
  const [filter, setFilter] = useState<WOStatus | null>(null)
  const [selectedWO, setSelectedWO] = useState<WO | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 将 mock workOrders 映射为带正确 status 类型的数组
  const allWOs: WO[] = (workOrders as any[]).map(wo => ({
    ...wo,
    status: wo.status as WOStatus,
  }))

  const handleCardClick = useCallback((wo: WO) => {
    setSelectedWO(wo)
    setDrawerOpen(true)
  }, [])

  return (
    <div style={{ background: BG, minHeight: '100%', display: 'flex', flexDirection: 'column', color: TEXT, fontFamily: 'system-ui, sans-serif' }}>

      {/* 顶部统计 */}
      <div style={{
        padding: '14px 20px',
        display: 'flex',
        gap: 12,
        borderBottom: `1px solid ${BORDER}`,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ color: MUTED, fontSize: 12, marginRight: 4 }}>工单总览</span>
        {COLUMNS.map(col => {
          const count = STAT_MAP[col.key]
          const active = filter === col.key
          return (
            <motion.button
              key={col.key}
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(active ? null : col.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                background: active ? `${col.color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? col.color + '60' : BORDER}`,
                color: active ? col.color : MUTED,
                fontSize: 12, fontWeight: active ? 600 : 400,
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
              {col.label}
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                fontSize: 13, color: active ? col.color : TEXT
              }}>{count}</span>
            </motion.button>
          )
        })}

        <div style={{ marginLeft: 'auto', color: MUTED, fontSize: 11 }}>
          <RobotOutlined style={{ marginRight: 4, color: PURPLE }} />
          AI调度系统运行中
        </div>
      </div>

      {/* Kanban 看板 */}
      <div style={{ flex: 1, overflowX: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 16, minWidth: 'max-content', alignItems: 'flex-start' }}>
          {COLUMNS.map(col => {
            const colWOs = allWOs.filter(wo => {
              if (filter && wo.status !== filter) return false
              return wo.status === col.key
            })
            const totalCount = STAT_MAP[col.key]

            return (
              <div key={col.key} style={{ width: 224, flexShrink: 0 }}>
                {/* 列标题 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', marginBottom: 12,
                  background: `${col.color}10`,
                  border: `1px solid ${col.color}30`,
                  borderRadius: 10,
                }}>
                  <span style={{ color: col.color, fontSize: 14 }}>{col.icon}</span>
                  <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{col.label}</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700, fontSize: 14, color: col.color,
                  }}>{totalCount}</span>
                </div>

                {/* 工单卡片 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                  <AnimatePresence>
                    {colWOs.length > 0 ? colWOs.map(wo => (
                      <WOCard key={wo.id} wo={wo} onClick={handleCardClick} />
                    )) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          border: `1px dashed ${BORDER}`,
                          borderRadius: 10, padding: '24px 0',
                          textAlign: 'center', color: MUTED, fontSize: 12,
                        }}
                      >
                        {filter ? '无匹配工单' : `共 ${totalCount} 张（分页显示）`}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 如果有更多未展示 */}
                  {!filter && totalCount > colWOs.length && colWOs.length > 0 && (
                    <div style={{
                      textAlign: 'center', color: MUTED, fontSize: 11,
                      border: `1px dashed ${BORDER}`, borderRadius: 8, padding: '8px 0', cursor: 'pointer',
                    }}>
                      +{totalCount - colWOs.length} 更多工单...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 工单详情 Drawer */}
      <WODrawer wo={selectedWO} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
