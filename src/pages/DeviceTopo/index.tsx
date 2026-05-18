import { useState, useEffect, useRef, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import { Tag, Typography, Badge } from 'antd'
import { analysisDevices, devices as allDevices } from '../../mock/data'

const { Text, Title } = Typography

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ReactorNode {
  id: string
  index: number
  status: 'running' | 'warning' | 'offline' | 'idle'
  cx: number
  cy: number
}

// ─────────────────────────────────────────────
// Build reactor grid positions
// ─────────────────────────────────────────────
function buildReactors(): ReactorNode[] {
  const result: ReactorNode[] = []
  // Zone A: R01-R16 (left 4x4)
  for (let i = 0; i < 16; i++) {
    const col = i % 4
    const row = Math.floor(i / 4)
    result.push({
      id: `R-${String(i + 1).padStart(2, '0')}`,
      index: i,
      status: allDevices[i].status as ReactorNode['status'],
      cx: 130 + col * 45,
      cy: 195 + row * 45,
    })
  }
  // Zone B: R17-R32 (right 4x4)
  for (let i = 0; i < 16; i++) {
    const col = i % 4
    const row = Math.floor(i / 4)
    result.push({
      id: `R-${String(i + 17).padStart(2, '0')}`,
      index: i + 16,
      status: allDevices[i + 16].status as ReactorNode['status'],
      cx: 490 + col * 45,
      cy: 195 + row * 45,
    })
  }
  return result
}

const reactors = buildReactors()

const statusColor: Record<string, string> = {
  running: '#00d4ff',
  warning: '#ffb800',
  offline: '#6b8aad',
  idle: '#2a3f5a',
}

// ─────────────────────────────────────────────
// Mini Trend Chart
// ─────────────────────────────────────────────
function TrendChart({ label, unit, baseVal, variance, color }: {
  label: string; unit: string; baseVal: number; variance: number; color: string
}) {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 20 }, () => baseVal + (Math.random() - 0.5) * variance * 2)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), baseVal + (Math.random() - 0.5) * variance * 2]
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [baseVal, variance])

  const option = {
    animation: false,
    grid: { top: 4, bottom: 4, left: 4, right: 4 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: {
      type: 'value', show: false,
      min: baseVal - variance * 3,
      max: baseVal + variance * 3,
    },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      areaStyle: { color: `${color}22` },
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: { value: number }[]) => `${params[0].value.toFixed(2)} ${unit}`,
      backgroundColor: '#0d1525',
      borderColor: 'rgba(255,255,255,0.08)',
      textStyle: { color: '#e8f4ff', fontSize: 11 },
    },
  }

  const latest = data[data.length - 1]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      padding: '8px 12px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: '#6b8aad', fontSize: 12 }}>{label}</Text>
        <Text style={{ color, fontSize: 13, fontWeight: 600 }}>{latest.toFixed(2)} {unit}</Text>
      </div>
      <ReactECharts option={option} style={{ height: 60 }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// SVG Topology
// ─────────────────────────────────────────────
function TopologySVG({ onSelectReactor, selectedId }: {
  onSelectReactor: (id: string) => void
  selectedId: string
}) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800)
    return () => clearInterval(id)
  }, [])

  const analysisDev = [
    { id: 'GPC-01', x: 80,  y: 40, status: 'running' },
    { id: 'DSC-01', x: 240, y: 40, status: 'idle'    },
    { id: 'NMR-01', x: 400, y: 40, status: 'running' },
    { id: 'IR-01',  x: 560, y: 40, status: 'idle'    },
  ]

  return (
    <svg viewBox="0 0 720 560" width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#080c18" stopOpacity="0" />
          <stop offset="20%" stopColor="#00d4ff" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#00d4ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#080c18" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Analysis Instruments ── */}
      {analysisDev.map((dev) => (
        <g key={dev.id}>
          <rect x={dev.x} y={dev.y} width={110} height={40} rx={6}
            fill="rgba(0,212,255,0.08)" stroke="#00d4ff" strokeWidth={1} />
          <text x={dev.x + 10} y={dev.y + 15} fill="#e8f4ff" fontSize={11} fontWeight={600}>{dev.id}</text>
          <circle cx={dev.x + 95} cy={dev.y + 12} r={5}
            fill={dev.status === 'running' ? '#00ff88' : '#ffb800'}>
            {dev.status === 'running' && (
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
          <text x={dev.x + 10} y={dev.y + 30} fill="#6b8aad" fontSize={9}>{dev.status === 'running' ? '运行中' : '空闲'}</text>
          {/* vertical line to bus */}
          <line x1={dev.x + 55} y1={dev.y + 40} x2={dev.x + 55} y2={135} stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.4} strokeDasharray="4 3" />
        </g>
      ))}

      {/* ── Data Bus ── */}
      <rect x={60} y={133} width={600} height={6} rx={3} fill="url(#busGrad)" filter="url(#glow)" />
      {/* Flow light on bus */}
      <rect x={60} y={133} width={80} height={6} rx={3} fill="rgba(255,255,255,0.6)">
        <animateTransform attributeName="transform" type="translate"
          from="-80 0" to="600 0" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x={60} y={126} fill="#6b8aad" fontSize={9}>数据总线</text>

      {/* Zone A lines from bus */}
      <line x1={210} y1={139} x2={210} y2={180} stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.3} />
      {/* Zone B lines from bus */}
      <line x1={510} y1={139} x2={510} y2={180} stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.3} />

      {/* ── Zone A Label ── */}
      <text x={90} y={177} fill="#6b8aad" fontSize={10} fontWeight={600}>反应区 A (R01-R16)</text>

      {/* ── Zone B Label ── */}
      <text x={450} y={177} fill="#6b8aad" fontSize={10} fontWeight={600}>反应区 B (R17-R32)</text>

      {/* ── Reactor nodes ── */}
      {reactors.map((r) => {
        const isSelected = r.id === selectedId
        const isWarning = r.status === 'warning'
        const isOff = r.status === 'offline' || r.status === 'idle'
        return (
          <g key={r.id} onClick={() => onSelectReactor(r.id)} style={{ cursor: 'pointer' }}>
            <circle
              cx={r.cx} cy={r.cy} r={14}
              fill={isSelected ? `${statusColor[r.status]}44` : `${statusColor[r.status]}22`}
              stroke={isSelected ? '#fff' : statusColor[r.status]}
              strokeWidth={isSelected ? 2.5 : 1.5}
              filter={isWarning ? 'url(#glow)' : undefined}
            >
              {isWarning && (
                <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
              )}
              {r.status === 'running' && !isWarning && (
                <animate attributeName="opacity" values="1;0.7;1" dur={`${2 + (r.index % 5) * 0.3}s`} repeatCount="indefinite" />
              )}
            </circle>
            <text x={r.cx} y={r.cy + 4} textAnchor="middle" fill={isOff ? '#3a5270' : '#e8f4ff'} fontSize={7} fontWeight={600}>
              {r.id.replace('R-', 'R')}
            </text>
          </g>
        )
      })}

      {/* ── Robotic Arms ── */}
      {[
        { label: '机械臂 A', x: 140, y: 420 },
        { label: '机械臂 B', x: 510, y: 420 },
      ].map((arm) => (
        <g key={arm.label}>
          <rect x={arm.x} y={arm.y} width={110} height={36} rx={6}
            fill="rgba(123,97,255,0.1)" stroke="#7b61ff" strokeWidth={1} />
          <text x={arm.x + 8} y={arm.y + 15} fill="#e8f4ff" fontSize={11}>{arm.label}</text>
          <text x={arm.x + 8} y={arm.y + 28} fill="#6b8aad" fontSize={9}>自动运行</text>
          {/* line up to reactor zone */}
          <line x1={arm.x + 55} y1={arm.y} x2={arm.x + 55} y2={388} stroke="#7b61ff" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 3" />
        </g>
      ))}

      {/* ── AGV Docks ── */}
      {[
        { label: 'AGV停靠点 A', x: 140, y: 488 },
        { label: 'AGV停靠点 B', x: 510, y: 488 },
      ].map((dock) => (
        <g key={dock.label}>
          <rect x={dock.x} y={dock.y} width={110} height={30} rx={4}
            fill="rgba(0,255,136,0.06)" stroke="#00ff88" strokeWidth={1} strokeDasharray="4 2" />
          <text x={dock.x + 8} y={dock.y + 12} fill="#00ff88" fontSize={9}>{dock.label}</text>
          <text x={dock.x + 8} y={dock.y + 24} fill="#6b8aad" fontSize={8}>AGV-001 待命</text>
        </g>
      ))}

      {/* Arm → AGV lines */}
      {[[195, 456, 195, 488], [565, 456, 565, 488]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,136,0.3)" strokeWidth={1} />
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function DeviceTopo() {
  const [selectedId, setSelectedId] = useState('R-08')

  const selectedDevice = allDevices.find((d) => d.id === selectedId)

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  }

  const statusLabel: Record<string, string> = {
    running: '运行中',
    warning: '告警',
    offline: '离线',
    idle: '空闲',
  }
  const statusTagColor: Record<string, string> = {
    running: 'cyan',
    warning: 'orange',
    offline: 'default',
    idle: 'default',
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#080c18', overflow: 'hidden', padding: 16, gap: 16 }}>

      {/* Left: SVG Topology */}
      <div style={{ flex: '0 0 70%', ...glass, padding: 20, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={5} style={{ color: '#e8f4ff', margin: 0 }}>设备拓扑 & 数字孪生</Title>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            {[
              { color: '#00d4ff', label: '运行中' },
              { color: '#ffb800', label: '告警' },
              { color: '#6b8aad', label: '空闲/离线' },
            ].map((l) => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b8aad' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <TopologySVG onSelectReactor={setSelectedId} selectedId={selectedId} />

        {/* Analysis Devices bar */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          {analysisDevices.map((d) => (
            <div key={d.id} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{d.id}</Text>
                <Badge status={d.status === 'running' ? 'processing' : 'default'} text={<span style={{ color: '#6b8aad', fontSize: 10 }}>{d.status === 'running' ? '运行' : '空闲'}</span>} />
              </div>
              <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>{d.protocol} · {d.latency}ms</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header card */}
        <div style={{ ...glass, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Title level={4} style={{ color: '#00d4ff', margin: 0 }}>{selectedId}</Title>
            <Tag color={statusTagColor[selectedDevice?.status ?? 'idle']}>
              {statusLabel[selectedDevice?.status ?? 'idle']}
            </Tag>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            {[
              { k: '通信协议', v: 'OPC UA' },
              { k: '当前实验', v: selectedDevice?.experiment ?? '无' },
              { k: '最近告警', v: selectedDevice?.status === 'warning' ? '温度异常' : '正常' },
              { k: '设备类型', v: '高压釜' },
            ].map(({ k, v }) => (
              <div key={k}>
                <div style={{ color: '#6b8aad' }}>{k}</div>
                <div style={{ color: '#e8f4ff', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend charts */}
        <div style={{ ...glass, padding: 16, flex: 1, overflowY: 'auto' }}>
          <Text style={{ color: '#e8f4ff', fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 12 }}>实时监控趋势</Text>
          <TrendChart key={`${selectedId}-temp`}    label="温度"   unit="°C"  baseVal={selectedDevice?.temp ?? 65}       variance={1}   color="#ff7849" />
          <TrendChart key={`${selectedId}-pres`}    label="压力"   unit="MPa" baseVal={selectedDevice?.pressure ?? 0.6}  variance={0.02} color="#00d4ff" />
          <TrendChart key={`${selectedId}-rpm`}     label="搅拌转速" unit="RPM" baseVal={selectedDevice?.rpm ?? 450}    variance={20}  color="#7b61ff" />
          <TrendChart key={`${selectedId}-level`}   label="液位"   unit="%"   baseVal={(selectedDevice?.level ?? 0.72) * 100} variance={2}  color="#00ff88" />
        </div>
      </div>
    </div>
  )
}
