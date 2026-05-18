import { useState, useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { motion } from 'framer-motion'
import {
  ExperimentOutlined,
  ApiOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { devices, alarms, workOrders } from '../../mock/data'

// ── 样式常量 ────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

// ── 数字动画 Hook ────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

// ── KPI 卡片 ─────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  prefix?: string
  color: string
  decimals?: number
  extra?: string
}

function KpiCard({ icon, label, value, suffix = '', prefix = '', color, decimals = 0, extra }: KpiCardProps) {
  const display = useCountUp(Math.floor(value))
  const displayStr = decimals > 0
    ? (display / Math.pow(10, decimals)).toFixed(decimals)
    : String(display)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        ...glass,
        flex: 1,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        minWidth: 0,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 4 }}>{label}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 26, fontWeight: 700, color,
          lineHeight: 1, whiteSpace: 'nowrap',
        }}>
          {prefix}{displayStr}{suffix}
        </div>
        {extra && <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 4 }}>{extra}</div>}
      </div>
    </motion.div>
  )
}

// ── 甘特图 Option ─────────────────────────────────────────
function getGanttOption() {
  const items = workOrders.slice(0, 7)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 8, top: 8, bottom: 4, containLabel: true },
    xAxis: {
      type: 'value', max: 100,
      axisLabel: { color: '#6b8aad', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: items.map(w => w.id.slice(-5)),
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: items.map(w => ({
        value: w.progress,
        itemStyle: {
          color: w.status === 'completed' ? '#00ff88' :
                 w.status === 'running' ? '#00d4ff' :
                 w.status === 'analyzing' ? '#7b61ff' :
                 '#3d5168',
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barMaxWidth: 14,
      label: { show: false },
    }],
  }
}

// ── 活性趋势 Option ──────────────────────────────────────
function getActivityOption() {
  const days = ['5/12', '5/13', '5/14', '5/15', '5/16', '5/17', '5/18']
  const data = [7200, 7850, 8120, 7940, 8560, 8320, 9240]
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: days,
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [{
      type: 'line', data,
      smooth: true,
      symbol: 'circle', symbolSize: 5,
      lineStyle: { color: '#00d4ff', width: 2 },
      itemStyle: { color: '#00d4ff' },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0.01)' }] },
      },
    }],
  }
}

// ── PDI 趋势 Option ──────────────────────────────────────
function getPdiOption() {
  const days = ['5/12', '5/13', '5/14', '5/15', '5/16', '5/17', '5/18']
  const data = [2.4, 2.2, 2.1, 2.3, 1.9, 2.0, 1.8]
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: days,
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', min: 1.5, max: 3,
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [{
      type: 'line', data,
      smooth: true,
      symbol: 'circle', symbolSize: 5,
      lineStyle: { color: '#7b61ff', width: 2 },
      itemStyle: { color: '#7b61ff' },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(123,97,255,0.3)' }, { offset: 1, color: 'rgba(123,97,255,0.01)' }] },
      },
    }],
  }
}

// ── 实验室拓扑 SVG ───────────────────────────────────────
function LabTopology() {
  // 32 个反应釜状态
  const reactorStatuses = devices.map(d => d.status as 'running' | 'warning' | 'offline' | 'idle')

  const colorMap: Record<string, string> = {
    running: '#00d4ff',
    warning: '#ffb800',
    offline: '#3d5168',
    idle: '#3d5168',
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes flow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulse-cyan {
          0%, 100% { filter: drop-shadow(0 0 4px #00d4ff); opacity: 1; }
          50% { filter: drop-shadow(0 0 10px #00d4ff); opacity: 0.85; }
        }
        @keyframes blink-warn {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .reactor-running { animation: pulse-cyan 2s ease-in-out infinite; }
        .reactor-warning { animation: blink-warn 1s ease-in-out infinite; }
        .data-bus { stroke-dasharray: 8 4; animation: flow 1s linear infinite; }
      `}</style>
      <svg viewBox="0 0 600 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* 背景 */}
        <rect width="600" height="420" fill="transparent" />

        {/* 标题 */}
        <text x="300" y="18" textAnchor="middle" fill="#6b8aad" fontSize="10" fontFamily="'JetBrains Mono',monospace">
          LABORATORY DEVICE TOPOLOGY
        </text>

        {/* ── 顶部分析仪器 ── */}
        {[
          { id: 'GPC', x: 60, status: 'running' },
          { id: 'DSC', x: 190, status: 'idle' },
          { id: 'NMR', x: 320, status: 'running' },
          { id: 'FTIR', x: 450, status: 'idle' },
        ].map(inst => (
          <g key={inst.id}>
            <rect
              x={inst.x - 36} y={26} width={72} height={28}
              rx={5}
              fill={inst.status === 'running' ? 'rgba(0,212,255,0.12)' : 'rgba(61,81,104,0.2)'}
              stroke={inst.status === 'running' ? '#00d4ff' : '#3d5168'}
              strokeWidth={1}
            />
            <text
              x={inst.x} y={44}
              textAnchor="middle" fill={inst.status === 'running' ? '#00d4ff' : '#6b8aad'}
              fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="600"
            >
              {inst.id}
            </text>
            {/* 向下连线到总线 */}
            <line x1={inst.x} y1={54} x2={inst.x} y2={84}
              stroke="rgba(0,212,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        ))}

        {/* ── 数据总线 ── */}
        <rect x={20} y={84} width={560} height={14} rx={7}
          fill="rgba(0,212,255,0.06)" stroke="rgba(0,212,255,0.2)" strokeWidth={1} />
        <line x1={30} y1={91} x2={570} y2={91}
          stroke="#00d4ff" strokeWidth={1.5} strokeOpacity={0.6} className="data-bus" />
        <text x="300" y="104" textAnchor="middle" fill="#00d4ff" fontSize="8" fontFamily="'JetBrains Mono',monospace" opacity={0.6}>
          DATA BUS  ◆  OPC UA / Modbus TCP / RS232
        </text>

        {/* 总线向下两条竖线 */}
        <line x1={155} y1={98} x2={155} y2={130}
          stroke="rgba(0,212,255,0.3)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={445} y1={98} x2={445} y2={130}
          stroke="rgba(0,212,255,0.3)" strokeWidth={1} strokeDasharray="3 3" />

        {/* ── 机械臂 ── */}
        {[{ x: 155, label: 'ARM-1' }, { x: 445, label: 'ARM-2' }].map(arm => (
          <g key={arm.label}>
            <rect x={arm.x - 38} y={130} width={76} height={24} rx={5}
              fill="rgba(123,97,255,0.15)" stroke="#7b61ff" strokeWidth={1} />
            <text x={arm.x} y={145} textAnchor="middle" fill="#7b61ff"
              fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="600">
              {arm.label}
            </text>
            {/* 向下连线 */}
            <line x1={arm.x} y1={154} x2={arm.x} y2={175}
              stroke="rgba(123,97,255,0.4)" strokeWidth={1} strokeDasharray="3 3" />
          </g>
        ))}

        {/* ── 反应釜网格 R01-R16 (左) ── */}
        {Array.from({ length: 16 }, (_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const cx = 50 + col * 55
          const cy = 188 + row * 52
          const status = reactorStatuses[i]
          const color = colorMap[status] || '#3d5168'
          const label = `R${String(i + 1).padStart(2, '0')}`
          return (
            <g key={label} className={status === 'running' ? 'reactor-running' : status === 'warning' ? 'reactor-warning' : ''}>
              {/* 外圈光晕 */}
              {status === 'running' && (
                <circle cx={cx} cy={cy} r={16} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3} />
              )}
              <circle cx={cx} cy={cy} r={13}
                fill={`${color}18`} stroke={color} strokeWidth={1.5} />
              <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
                fontSize="8" fontFamily="'JetBrains Mono',monospace" fontWeight="600">
                {label}
              </text>
            </g>
          )
        })}

        {/* 左侧标签 */}
        <text x="28" y="180" fill="#6b8aad" fontSize="9" fontFamily="'JetBrains Mono',monospace">R01-R16</text>

        {/* ── 反应釜网格 R17-R32 (右) ── */}
        {Array.from({ length: 16 }, (_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const cx = 380 + col * 55
          const cy = 188 + row * 52
          const status = reactorStatuses[i + 16]
          const color = colorMap[status] || '#3d5168'
          const label = `R${String(i + 17).padStart(2, '0')}`
          return (
            <g key={label} className={status === 'running' ? 'reactor-running' : status === 'warning' ? 'reactor-warning' : ''}>
              {status === 'running' && (
                <circle cx={cx} cy={cy} r={16} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3} />
              )}
              <circle cx={cx} cy={cy} r={13}
                fill={`${color}18`} stroke={color} strokeWidth={1.5} />
              <text x={cx} y={cy + 4} textAnchor="middle" fill={color}
                fontSize="8" fontFamily="'JetBrains Mono',monospace" fontWeight="600">
                {label}
              </text>
            </g>
          )
        })}

        {/* 右侧标签 */}
        <text x="358" y="180" fill="#6b8aad" fontSize="9" fontFamily="'JetBrains Mono',monospace">R17-R32</text>

        {/* 分隔线 */}
        <line x1={300} y1={175} x2={300} y2={410} stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="4 4" />

        {/* 图例 */}
        <g transform="translate(200, 400)">
          <circle cx={0} cy={0} r={5} fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth={1.5} />
          <text x={10} y={4} fill="#6b8aad" fontSize="9">运行中</text>
          <circle cx={60} cy={0} r={5} fill="rgba(255,184,0,0.2)" stroke="#ffb800" strokeWidth={1.5} />
          <text x={70} y={4} fill="#6b8aad" fontSize="9">告警</text>
          <circle cx={110} cy={0} r={5} fill="rgba(61,81,104,0.2)" stroke="#3d5168" strokeWidth={1.5} />
          <text x={120} y={4} fill="#6b8aad" fontSize="9">离线/空闲</text>
        </g>
      </svg>
    </div>
  )
}

// ── 告警列表 ─────────────────────────────────────────────
function AlarmList() {
  const levelConfig: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
    critical: { color: '#ff4757', icon: <WarningOutlined />, bg: 'rgba(255,71,87,0.08)' },
    warning: { color: '#ffb800', icon: <WarningOutlined />, bg: 'rgba(255,184,0,0.08)' },
    info: { color: '#6b8aad', icon: <InfoCircleOutlined />, bg: 'rgba(107,138,173,0.08)' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alarms.slice(0, 5).map((alarm, i) => {
        const cfg = levelConfig[alarm.level] ?? levelConfig.info
        return (
          <motion.div
            key={alarm.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              ...glass,
              padding: '10px 12px',
              borderLeft: `3px solid ${cfg.color}`,
              background: cfg.bg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
              <span style={{ color: cfg.color, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
                {alarm.device}
              </span>
              <span style={{ color: '#3d5168', fontSize: 10, marginLeft: 'auto' }}>{alarm.time}</span>
            </div>
            <div style={{ color: '#e8f4ff', fontSize: 11, lineHeight: 1.4 }}>{alarm.message}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── AI 推荐预览 ──────────────────────────────────────────
function AiRecommendCard() {
  return (
    <div style={{
      ...glass,
      padding: '14px 16px',
      marginTop: 12,
      borderColor: 'rgba(123,97,255,0.3)',
      background: 'rgba(123,97,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <RocketOutlined style={{ color: '#7b61ff', fontSize: 14 }} />
        <span style={{ color: '#7b61ff', fontSize: 12, fontWeight: 600 }}>AI 最新推荐</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(123,97,255,0.2)', color: '#7b61ff',
          fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
          置信度 94%
        </span>
      </div>
      <div style={{ color: '#e8f4ff', fontSize: 12, lineHeight: 1.6 }}>
        建议尝试 <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace" }}>Cp₂ZrCl₂/MAO</span> 体系
      </div>
      <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>
        Al/Zr = 1000，T = 68°C，预测活性
        <span style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace", margin: '0 4px' }}>10,840</span>
        kg PE/mol·h
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        {['PDI: 1.75', 'Tm: 137°C', 'Ð: 窄分布'].map(tag => (
          <span key={tag} style={{
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff', fontSize: 10, padding: '2px 8px', borderRadius: 4,
            fontFamily: "'JetBrains Mono',monospace",
          }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

// ── 主页面 ───────────────────────────────────────────────
export default function Dashboard() {
  const [uptime, setUptime] = useState({ h: 312, m: 47, s: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => {
        const totalSec = prev.h * 3600 + prev.m * 60 + prev.s + 1
        return { h: Math.floor(totalSec / 3600), m: Math.floor((totalSec % 3600) / 60), s: totalSec % 60 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      height: '100%', overflow: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ── KPI 条 ── */}
      <div style={{ display: 'flex', gap: 14 }}>
        <KpiCard
          icon={<ExperimentOutlined />}
          label="今日实验批次"
          value={47}
          suffix=" 批"
          color="#00d4ff"
          extra="较昨日 +3 批"
        />
        <KpiCard
          icon={<ApiOutlined />}
          label="运行中反应釜"
          value={28}
          suffix="/32"
          color="#00ff88"
          extra="利用率 87.5%"
        />
        <KpiCard
          icon={<RocketOutlined />}
          label="AI推荐准确率"
          value={873}
          suffix="%"
          color="#7b61ff"
          decimals={1}
          extra="本月提升 +2.1%"
        />
        <div style={{
          ...glass,
          flex: 1,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#ffb800', flexShrink: 0,
          }}>
            <ClockCircleOutlined />
          </div>
          <div>
            <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 4 }}>系统运行时长</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: '#ffb800', lineHeight: 1 }}>
              {uptime.h}h {String(uptime.m).padStart(2, '0')}m
              <span style={{ fontSize: 14, opacity: 0.7 }}> {String(uptime.s).padStart(2, '0')}s</span>
            </div>
            <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 4 }}>连续稳定运行</div>
          </div>
        </div>
      </div>

      {/* ── 中央三列 ── */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

        {/* 左列 */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...glass, padding: '14px 14px 10px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>今日工单进度</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ReactECharts option={getGanttOption()} style={{ height: '100%' }} />
            </div>
          </div>
          <div style={{ ...glass, padding: '14px' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>样本统计</div>
            {[
              { label: '已完成实验', val: '1,247', color: '#00ff88' },
              { label: '今日上样', val: '23', color: '#00d4ff' },
              { label: '分析中', val: '8', color: '#7b61ff' },
              { label: '待处理', val: '12', color: '#ffb800' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <span style={{ color: '#6b8aad', fontSize: 12 }}>{item.label}</span>
                <span style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700 }}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 中央：拓扑图 */}
        <div style={{ flex: 1, minWidth: 0, ...glass, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10 }}>
            <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>实验室设备拓扑</span>
            <span style={{ color: '#00ff88', fontSize: 11 }}><CheckCircleOutlined /> 系统正常</span>
            <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 'auto' }}>
              实时刷新 <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace" }}>1s</span>
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <LabTopology />
          </div>
        </div>

        {/* 右列 */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
          <div style={{ ...glass, padding: '14px' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              <WarningOutlined style={{ color: '#ff4757', marginRight: 6 }} />实时告警
              <span style={{ background: '#ff4757', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 8, marginLeft: 8 }}>
                {alarms.filter(a => !a.handled).length}
              </span>
            </div>
            <AlarmList />
          </div>
          <AiRecommendCard />
        </div>
      </div>

      {/* ── 底部统计行 ── */}
      <div style={{ display: 'flex', gap: 14 }}>
        {/* 活性分布趋势 */}
        <div style={{ ...glass, flex: 1, padding: '14px', minWidth: 0 }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>催化活性趋势 (7日)</div>
          <ReactECharts option={getActivityOption()} style={{ height: 100 }} />
        </div>

        {/* PDI 均值趋势 */}
        <div style={{ ...glass, flex: 1, padding: '14px', minWidth: 0 }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>PDI 均值趋势 (7日)</div>
          <ReactECharts option={getPdiOption()} style={{ height: 100 }} />
        </div>

        {/* 科研产出统计 */}
        <div style={{ ...glass, flex: 1, padding: '14px 20px', minWidth: 0 }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>科研产出统计</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { num: '24', unit: '个', label: '高活性配方', color: '#00ff88' },
              { num: '8.6x', unit: '', label: '效率提升', color: '#7b61ff' },
              { num: '183', unit: '次', label: '节省实验', color: '#00d4ff' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1,
                }}>
                  {stat.num}<span style={{ fontSize: 14 }}>{stat.unit}</span>
                </div>
                <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
