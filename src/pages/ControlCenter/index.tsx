import { useSyncExternalStore, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, Badge } from 'antd'
import {
  ApiOutlined, ThunderboltOutlined, FireOutlined, AlertOutlined,
  ExperimentOutlined, RightOutlined, ApartmentOutlined,
} from '@ant-design/icons'
import {
  devices, mfcDevices, tcuDevices, torqueSensors, valveBank,
  o2h2oSensors, vacuumPumps, analysisDevices,
} from '../../mock/data'
import EmergencyStopButton from '../../components/Control/EmergencyStopButton'
import { getControlLogs, subscribe, isEstopActive } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

// ── Types ──────────────────────────────────────────────────────────
interface ReactorNode {
  id: string
  index: number
  status: 'running' | 'warning' | 'offline' | 'idle'
  cx: number
  cy: number
}

const statusColor: Record<string, string> = {
  running: '#00d4ff',
  warning: '#ffb800',
  offline: '#6b8aad',
  idle: '#2a3f5a',
}

function buildReactors(): ReactorNode[] {
  const result: ReactorNode[] = []
  for (let i = 0; i < 16; i++) {
    result.push({
      id: `R-${String(i + 1).padStart(2, '0')}`,
      index: i,
      status: devices[i].status as ReactorNode['status'],
      cx: 130 + (i % 4) * 45,
      cy: 190 + Math.floor(i / 4) * 45,
    })
  }
  for (let i = 0; i < 16; i++) {
    result.push({
      id: `R-${String(i + 17).padStart(2, '0')}`,
      index: i + 16,
      status: devices[i + 16].status as ReactorNode['status'],
      cx: 490 + (i % 4) * 45,
      cy: 190 + Math.floor(i / 4) * 45,
    })
  }
  return result
}

const reactors = buildReactors()

// ── Topology SVG ───────────────────────────────────────────────────
function TopologySVG({ onSelectReactor, selectedId }: {
  onSelectReactor: (id: string) => void
  selectedId: string
}) {
  const analysisDev = [
    { id: 'GPC-01', x: 80,  y: 36, status: 'running' },
    { id: 'DSC-01', x: 240, y: 36, status: 'idle'    },
    { id: 'NMR-01', x: 400, y: 36, status: 'running' },
    { id: 'IR-01',  x: 560, y: 36, status: 'idle'    },
  ]

  return (
    <svg viewBox="0 0 720 520" width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="busGradCC" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#080c18"  stopOpacity="0" />
          <stop offset="20%"  stopColor="#00d4ff"  stopOpacity="0.8" />
          <stop offset="80%"  stopColor="#00d4ff"  stopOpacity="0.8" />
          <stop offset="100%" stopColor="#080c18"  stopOpacity="0" />
        </linearGradient>
        <filter id="glowCC">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Analysis instruments */}
      {analysisDev.map(dev => (
        <g key={dev.id}>
          <rect x={dev.x} y={dev.y} width={110} height={38} rx={6}
            fill="rgba(0,212,255,0.08)" stroke="#00d4ff" strokeWidth={1} />
          <text x={dev.x + 10} y={dev.y + 14} fill="#e8f4ff" fontSize={11} fontWeight={600}>{dev.id}</text>
          <circle cx={dev.x + 95} cy={dev.y + 11} r={5}
            fill={dev.status === 'running' ? '#00ff88' : '#ffb800'}>
            {dev.status === 'running' && (
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            )}
          </circle>
          <text x={dev.x + 10} y={dev.y + 28} fill="#6b8aad" fontSize={9}>
            {dev.status === 'running' ? '运行中' : '空闲'}
          </text>
          <line x1={dev.x + 55} y1={dev.y + 38} x2={dev.x + 55} y2={128}
            stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.4} strokeDasharray="4 3" />
        </g>
      ))}

      {/* Data bus */}
      <rect x={60} y={126} width={600} height={6} rx={3}
        fill="url(#busGradCC)" filter="url(#glowCC)" />
      <rect x={60} y={126} width={80} height={6} rx={3} fill="rgba(255,255,255,0.6)">
        <animateTransform attributeName="transform" type="translate"
          from="-80 0" to="600 0" dur="2s" repeatCount="indefinite" />
      </rect>
      <text x={60} y={120} fill="#6b8aad" fontSize={9}>数据总线</text>

      <line x1={210} y1={132} x2={210} y2={172} stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.3} />
      <line x1={510} y1={132} x2={510} y2={172} stroke="#00d4ff" strokeWidth={1} strokeOpacity={0.3} />

      <text x={90}  y={170} fill="#6b8aad" fontSize={10} fontWeight={600}>反应区 A (R01–R16)</text>
      <text x={450} y={170} fill="#6b8aad" fontSize={10} fontWeight={600}>反应区 B (R17–R32)</text>

      {/* Reactor nodes */}
      {reactors.map(r => {
        const isSelected = r.id === selectedId
        const isWarning  = r.status === 'warning'
        const isOff      = r.status === 'offline' || r.status === 'idle'
        return (
          <g key={r.id} onClick={() => onSelectReactor(r.id)} style={{ cursor: 'pointer' }}>
            <circle
              cx={r.cx} cy={r.cy} r={14}
              fill={isSelected ? `${statusColor[r.status]}44` : `${statusColor[r.status]}22`}
              stroke={isSelected ? '#fff' : statusColor[r.status]}
              strokeWidth={isSelected ? 2.5 : 1.5}
              filter={isWarning ? 'url(#glowCC)' : undefined}
            >
              {isWarning && <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />}
              {r.status === 'running' && !isWarning && (
                <animate attributeName="opacity" values="1;0.7;1" dur={`${2 + (r.index % 5) * 0.3}s`} repeatCount="indefinite" />
              )}
            </circle>
            <text x={r.cx} y={r.cy + 4} textAnchor="middle"
              fill={isOff ? '#3a5270' : '#e8f4ff'} fontSize={7} fontWeight={600}>
              {r.id.replace('R-', 'R')}
            </text>
          </g>
        )
      })}

      {/* Robotic arms */}
      {[{ label: '机械臂 A', x: 140, y: 405 }, { label: '机械臂 B', x: 510, y: 405 }].map(arm => (
        <g key={arm.label}>
          <rect x={arm.x} y={arm.y} width={110} height={34} rx={6}
            fill="rgba(123,97,255,0.1)" stroke="#7b61ff" strokeWidth={1} />
          <text x={arm.x + 8} y={arm.y + 14} fill="#e8f4ff" fontSize={11}>{arm.label}</text>
          <text x={arm.x + 8} y={arm.y + 27} fill="#6b8aad" fontSize={9}>自动运行</text>
          <line x1={arm.x + 55} y1={arm.y} x2={arm.x + 55} y2={382}
            stroke="#7b61ff" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 3" />
        </g>
      ))}

      {/* AGV docks */}
      {[{ label: 'AGV停靠点 A', x: 140, y: 465 }, { label: 'AGV停靠点 B', x: 510, y: 465 }].map(dock => (
        <g key={dock.label}>
          <rect x={dock.x} y={dock.y} width={110} height={28} rx={4}
            fill="rgba(0,255,136,0.06)" stroke="#00ff88" strokeWidth={1} strokeDasharray="4 2" />
          <text x={dock.x + 8} y={dock.y + 11} fill="#00ff88" fontSize={9}>{dock.label}</text>
          <text x={dock.x + 8} y={dock.y + 22} fill="#6b8aad" fontSize={8}>AGV-001 待命</text>
        </g>
      ))}
      {[[195, 439, 195, 465], [565, 439, 565, 465]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,136,0.3)" strokeWidth={1} />
      ))}
    </svg>
  )
}

// ── KPI Card ────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  suffix?: string
  color: string
  sub?: string
}
function KpiCard({ icon, label, value, suffix, color, sub }: KpiCardProps) {
  return (
    <div style={{ ...glass, padding: '14px 16px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color, fontSize: 16 }}>{icon}</span>
        <span style={{ color: '#6b8aad', fontSize: 12 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ color, fontSize: 28, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</span>
        {suffix && <span style={{ color: '#6b8aad', fontSize: 12 }}>{suffix}</span>}
      </div>
      {sub && <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────
export default function ControlCenter() {
  const navigate = useNavigate()
  const [, force] = useState(0)
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)
  const [selectedId, setSelectedId] = useState('R-08')

  useEffect(() => {
    const unsub = subscribe(() => force(x => x + 1))
    return () => { unsub() }
  }, [])

  const onlineMfc   = mfcDevices.filter(m => m.status === 'online').length
  const tcuLocked   = tcuDevices.filter(t => Math.abs(t.inner - t.setpoint) < 1.5).length
  const valvesOpen  = valveBank.filter(v => v.state === 'open').length
  const overload    = torqueSensors.filter(t => t.overload).length
  const logs        = getControlLogs().slice(0, 12)
  const reactorList = devices.slice(0, 32)
  const selDev      = devices.find(d => d.id === selectedId)

  const statusLabel: Record<string, string> = {
    running: '运行中', warning: '告警', offline: '离线', idle: '空闲',
  }

  const tiles = [
    { id: 'atmos',  label: '气氛与水氧',   icon: <ApiOutlined />,        color: '#00d4ff', path: '/control/atmosphere',
      desc: `H₂O ${o2h2oSensors[0].h2o.toFixed(2)} ppm · 真空泵 ${vacuumPumps.filter(v => v.status === 'running').length}/${vacuumPumps.length} 运行` },
    { id: 'feed',   label: '进料与配制',   icon: <ExperimentOutlined />,  color: '#7b61ff', path: '/control/feeding',
      desc: '注射泵 4 通道 · 天平闭环 · 多位阀' },
    { id: 'polym',  label: '聚合反应控制', icon: <FireOutlined />,        color: '#ff7849', path: '/control/polymerization',
      desc: `MFC ${onlineMfc}/${mfcDevices.length} 在线 · TCU PID 锁定 ${tcuLocked}` },
    { id: 'quench', label: '终止与泄压',   icon: <AlertOutlined />,       color: '#ff4757', path: '/control/quench',
      desc: '终止泵 4 路 · 背压阀 4 路' },
  ]

  const subStatus = (rId: string) => {
    const m  = mfcDevices.find(x => x.reactor === rId)
    const t  = tcuDevices.find(x => x.reactor === rId)
    const tr = torqueSensors.find(x => x.reactor === rId)
    const v  = valveBank.filter(x => x.reactor === rId)
    return {
      mfc:    m?.status === 'online' ? '#00ff88' : '#3d5168',
      tcu:    t?.status === 'online' ? (Math.abs((t?.inner ?? 0) - (t?.setpoint ?? 0)) < 1.5 ? '#00ff88' : '#ffb800') : '#3d5168',
      torque: tr?.overload ? '#ff4757' : (tr ? '#00ff88' : '#3d5168'),
      valve:  v.some(x => x.state === 'open') ? '#00d4ff' : '#3d5168',
    }
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 16,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* Estop banner */}
      {estop && (
        <div style={{
          background: 'rgba(255,71,87,0.12)', border: '1px solid #ff4757',
          color: '#ff4757', padding: '10px 16px', borderRadius: 8, fontWeight: 600,
        }}>
          紧急停车联锁中 · 所有控制操作已禁用
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <KpiCard icon={<ApiOutlined />}        label="MFC 在线"    value={onlineMfc}   suffix={`/ ${mfcDevices.length}`}  color="#00d4ff" sub="质量流量控制器" />
        <KpiCard icon={<FireOutlined />}       label="TCU PID 锁定" value={tcuLocked}  suffix={`/ ${tcuDevices.length}`}  color="#ff7849" sub="温度偏差 < 1.5°C" />
        <KpiCard icon={<ThunderboltOutlined />} label="阀门开启"   value={valvesOpen}  suffix={`/ ${valveBank.length}`}   color="#00ff88" sub="气动阀门组" />
        <KpiCard icon={<AlertOutlined />}      label="扭矩超限"    value={overload}    color={overload > 0 ? '#ff4757' : '#6b8aad'} sub="搅拌器抱轴风险" />
      </div>

      {/* Sub-module tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {tiles.map(t => (
          <div
            key={t.id}
            onClick={() => navigate(t.path)}
            style={{ ...glass, padding: '16px 18px', cursor: 'pointer', borderColor: `${t.color}55`, transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = t.color)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${t.color}55`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: t.color, fontSize: 22 }}>{t.icon}</span>
              <RightOutlined style={{ color: t.color, fontSize: 12 }} />
            </div>
            <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
            <div style={{ color: '#6b8aad', fontSize: 11, lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* ══ 设备拓扑 & 数字孪生 ══ */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* SVG Topology */}
        <div style={{ ...glass, padding: '14px 16px', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ApartmentOutlined style={{ color: '#00d4ff', fontSize: 14 }} />
              <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>设备拓扑 & 数字孪生</span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6b8aad' }}>
              {[{ c: '#00d4ff', l: '运行中' }, { c: '#ffb800', l: '告警' }, { c: '#6b8aad', l: '空闲/离线' }].map(x => (
                <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, display: 'inline-block' }} />{x.l}
                </span>
              ))}
            </div>
          </div>
          <TopologySVG onSelectReactor={setSelectedId} selectedId={selectedId} />

          {/* Analysis devices bar */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {analysisDevices.map(d => (
              <div key={d.id} style={{
                flex: 1, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{d.id}</span>
                  <Badge
                    status={d.status === 'running' ? 'processing' : 'default'}
                    text={<span style={{ color: '#6b8aad', fontSize: 10 }}>{d.status === 'running' ? '运行' : '空闲'}</span>}
                  />
                </div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>{d.protocol} · {d.latency}ms</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reactor detail panel */}
        <div style={{ ...glass, padding: '14px 16px', width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#00d4ff', fontSize: 16, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{selectedId}</span>
              <Tag color={selDev?.status === 'running' ? 'cyan' : selDev?.status === 'warning' ? 'orange' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                {statusLabel[selDev?.status ?? 'idle']}
              </Tag>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              {[
                { k: '通信协议', v: 'OPC UA' },
                { k: '当前实验', v: selDev?.experiment ?? '无' },
                { k: '最近告警', v: selDev?.status === 'warning' ? '温度异常' : '正常' },
                { k: '设备类型', v: '高压釜' },
              ].map(({ k, v }) => (
                <div key={k}>
                  <div style={{ color: '#6b8aad' }}>{k}</div>
                  <div style={{ color: '#e8f4ff', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
            <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 8 }}>实时参数</div>
            {[
              { label: '温度', value: `${selDev?.temp?.toFixed(1) ?? '--'} °C`, color: '#ff7849' },
              { label: '压力', value: `${selDev?.pressure?.toFixed(2) ?? '--'} MPa`, color: '#00d4ff' },
              { label: '转速', value: `${selDev?.rpm ?? '--'} RPM`, color: '#7b61ff' },
              { label: '液位', value: `${((selDev?.level ?? 0) * 100).toFixed(0)} %`, color: '#00ff88' },
            ].map(p => (
              <div key={p.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 12,
              }}>
                <span style={{ color: '#6b8aad' }}>{p.label}</span>
                <span style={{ color: p.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 32-reactor health matrix */}
      <div style={{ ...glass, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>32 釜控制健康度矩阵</span>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6b8aad' }}>
            {[['#00ff88', 'MFC'], ['#ff7849', 'TCU'], ['#7b61ff', '扭矩'], ['#00d4ff', '阀门']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {reactorList.map(r => {
            const s = subStatus(r.id)
            const offline = r.status === 'offline'
            return (
              <div
                key={r.id}
                onClick={() => { navigate(`/control/polymerization?reactor=${r.id}`); setSelectedId(r.id) }}
                style={{
                  background: offline ? 'rgba(107,138,173,0.05)' : 'rgba(0,212,255,0.05)',
                  border: `1px solid ${offline ? 'rgba(107,138,173,0.2)' : 'rgba(0,212,255,0.25)'}`,
                  borderRadius: 8, padding: '8px 10px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = offline ? 'rgba(107,138,173,0.08)' : 'rgba(0,212,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = offline ? 'rgba(107,138,173,0.05)' : 'rgba(0,212,255,0.05)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#e8f4ff', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{r.id}</span>
                  <Tag color={r.status === 'running' ? 'cyan' : r.status === 'warning' ? 'orange' : 'default'}
                    style={{ margin: 0, fontSize: 9, padding: '0 4px', lineHeight: '14px' }}>
                    {r.status === 'running' ? '运行' : r.status === 'warning' ? '告警' : r.status === 'offline' ? '离线' : '空闲'}
                  </Tag>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[s.mfc, s.tcu, s.torque, s.valve].map((c, i) => (
                    <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: c, opacity: offline ? 0.3 : 1 }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Logs + Estop */}
      <div style={{ display: 'flex', gap: 16, minHeight: 220 }}>
        <div style={{ ...glass, padding: '14px 16px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            控制指令日志
            <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>最近 {logs.length} 条</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {logs.map(l => (
              <div key={l.id} style={{
                display: 'grid', gridTemplateColumns: '70px 70px 110px 1fr 60px 60px',
                alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4,
                background: 'rgba(255,255,255,0.02)', fontSize: 11,
              }}>
                <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace' }}>{l.time}</span>
                <span style={{ color: '#7b61ff' }}>{l.user}</span>
                <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>{l.device}</span>
                <span style={{ color: '#e8f4ff' }}>{l.action}</span>
                <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>{String(l.before)}</span>
                <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace' }}>→ {String(l.after)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...glass, padding: '14px 16px', width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ color: '#ff4757', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>EMERGENCY STOP</div>
          <EmergencyStopButton size="large" />
          <div style={{ color: '#6b8aad', fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
            紧急停车按钮<br />
            点击后立即切断所有进气、关闭加热、启用冷却
          </div>
        </div>
      </div>
    </div>
  )
}
