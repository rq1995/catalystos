import { useSyncExternalStore, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag } from 'antd'
import {
  ApiOutlined, ThunderboltOutlined, FireOutlined, AlertOutlined,
  ExperimentOutlined, RightOutlined,
} from '@ant-design/icons'
import {
  devices, mfcDevices, tcuDevices, torqueSensors, valveBank,
  o2h2oSensors, vacuumPumps,
} from '../../mock/data'
import EmergencyStopButton from '../../components/Control/EmergencyStopButton'
import { getControlLogs, subscribe, isEstopActive } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

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

export default function ControlCenter() {
  const navigate = useNavigate()
  const [_, force] = useState(0)
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)

  useEffect(() => {
    const unsub = subscribe(() => force(x => x + 1))
    return () => { unsub() }
  }, [])

  const onlineMfc = mfcDevices.filter(m => m.status === 'online').length
  const tcuLocked = tcuDevices.filter(t => Math.abs(t.inner - t.setpoint) < 1.5).length
  const valvesOpen = valveBank.filter(v => v.state === 'open').length
  const overload = torqueSensors.filter(t => t.overload).length

  const logs = getControlLogs().slice(0, 12)

  const reactors = devices.slice(0, 32)

  const tiles = [
    { id: 'atmos', label: '气氛与水氧', icon: <ApiOutlined />, color: '#00d4ff', path: '/control/atmosphere',
      desc: `H₂O ${o2h2oSensors[0].h2o.toFixed(2)} ppm · 真空泵 ${vacuumPumps.filter(v => v.status === 'running').length}/${vacuumPumps.length} 运行` },
    { id: 'feed', label: '进料与配制', icon: <ExperimentOutlined />, color: '#7b61ff', path: '/control/feeding',
      desc: '注射泵 4 通道 · 天平闭环 · 多位阀' },
    { id: 'polym', label: '聚合反应控制', icon: <FireOutlined />, color: '#ff7849', path: '/control/polymerization',
      desc: `MFC ${onlineMfc}/${mfcDevices.length} 在线 · TCU PID 锁定 ${tcuLocked}` },
    { id: 'quench', label: '终止与泄压', icon: <AlertOutlined />, color: '#ff4757', path: '/control/quench',
      desc: '终止泵 4 路 · 背压阀 4 路' },
  ]

  const subStatus = (rId: string) => {
    const m = mfcDevices.find(x => x.reactor === rId)
    const t = tcuDevices.find(x => x.reactor === rId)
    const tr = torqueSensors.find(x => x.reactor === rId)
    const v = valveBank.filter(x => x.reactor === rId)
    return {
      mfc: m?.status === 'online' ? '#00ff88' : '#3d5168',
      tcu: t?.status === 'online' ? (t && Math.abs(t.inner - t.setpoint) < 1.5 ? '#00ff88' : '#ffb800') : '#3d5168',
      torque: tr?.overload ? '#ff4757' : (tr ? '#00ff88' : '#3d5168'),
      valve: v.some(x => x.state === 'open') ? '#00d4ff' : '#3d5168',
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
          background: 'rgba(255,71,87,0.12)',
          border: '1px solid #ff4757',
          color: '#ff4757', padding: '10px 16px', borderRadius: 8,
          fontWeight: 600,
        }}>
          紧急停车联锁中 · 所有控制操作已禁用
        </div>
      )}

      {/* KPI 行 */}
      <div style={{ display: 'flex', gap: 16 }}>
        <KpiCard icon={<ApiOutlined />} label="MFC 在线" value={onlineMfc} suffix={`/ ${mfcDevices.length}`} color="#00d4ff" sub="质量流量控制器" />
        <KpiCard icon={<FireOutlined />} label="TCU PID 锁定" value={tcuLocked} suffix={`/ ${tcuDevices.length}`} color="#ff7849" sub="温度偏差 < 1.5°C" />
        <KpiCard icon={<ThunderboltOutlined />} label="阀门开启" value={valvesOpen} suffix={`/ ${valveBank.length}`} color="#00ff88" sub="气动阀门组" />
        <KpiCard icon={<AlertOutlined />} label="扭矩超限" value={overload} color={overload > 0 ? '#ff4757' : '#6b8aad'} sub="搅拌器抱轴风险" />
      </div>

      {/* 子模块入口 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {tiles.map(t => (
          <div
            key={t.id}
            onClick={() => navigate(t.path)}
            style={{
              ...glass,
              padding: '16px 18px',
              cursor: 'pointer',
              borderColor: `${t.color}55`,
              transition: 'all 0.15s',
            }}
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

      {/* 反应釜矩阵 */}
      <div style={{ ...glass, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>32 釜控制健康度矩阵</span>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#6b8aad' }}>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00ff88', marginRight: 4 }} />MFC</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff7849', marginRight: 4 }} />TCU</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#7b61ff', marginRight: 4 }} />扭矩</span>
            <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', marginRight: 4 }} />阀门</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {reactors.map(r => {
            const s = subStatus(r.id)
            const offline = r.status === 'offline'
            return (
              <div
                key={r.id}
                onClick={() => navigate(`/control/polymerization?reactor=${r.id}`)}
                style={{
                  background: offline ? 'rgba(107,138,173,0.05)' : 'rgba(0,212,255,0.05)',
                  border: `1px solid ${offline ? 'rgba(107,138,173,0.2)' : 'rgba(0,212,255,0.25)'}`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = offline ? 'rgba(107,138,173,0.08)' : 'rgba(0,212,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = offline ? 'rgba(107,138,173,0.05)' : 'rgba(0,212,255,0.05)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#e8f4ff', fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{r.id}</span>
                  <Tag color={r.status === 'running' ? 'cyan' : r.status === 'warning' ? 'orange' : 'default'} style={{ margin: 0, fontSize: 9, padding: '0 4px', lineHeight: '14px' }}>
                    {r.status === 'running' ? '运行' : r.status === 'warning' ? '告警' : r.status === 'offline' ? '离线' : '空闲'}
                  </Tag>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[s.mfc, s.tcu, s.torque, s.valve].map((c, i) => (
                    <span key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: c, opacity: offline ? 0.3 : 1,
                    }} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部：日志 + Estop */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 240 }}>
        <div style={{ ...glass, padding: '14px 16px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            控制指令日志
            <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>最近 {logs.length} 条</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {logs.map(l => (
              <div key={l.id} style={{
                display: 'grid', gridTemplateColumns: '70px 70px 110px 1fr 60px 60px',
                alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 4,
                background: 'rgba(255,255,255,0.02)',
                fontSize: 11,
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
