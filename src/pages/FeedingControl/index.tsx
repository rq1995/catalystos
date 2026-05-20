import { useEffect, useState, useSyncExternalStore } from 'react'
import ReactECharts from 'echarts-for-react'
import { Button, InputNumber, Tag, Progress, Select, message } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { syringePumps as initSyringePumps, balances, rotaryValves } from '../../mock/data'
import SetpointInput from '../../components/Control/SetpointInput'
import { pushControlLog, isEstopActive, subscribe } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
}

interface SyringeState {
  id: string
  channel: number
  group: string
  solvent: string
  setpointFlow: number
  actualFlow: number
  setpointVolume: number
  pushed: number
  pressure: number
  status: 'idle' | 'running' | 'done'
}

function MultiPortValve({
  id, currentPort, ports, onSelect, disabled,
}: { id: string; currentPort: number; ports: string[]; onSelect: (p: number) => void; disabled?: boolean }) {
  const cx = 90, cy = 90, R = 72, r = 14
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{id}</span>
        <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>P{currentPort} · {ports[currentPort - 1]}</span>
      </div>
      <svg viewBox="0 0 180 180" width="100%" height="180">
        <circle cx={cx} cy={cy} r={R} fill="rgba(0,212,255,0.04)" stroke="#00d4ff44" />
        {ports.map((label, i) => {
          const angle = (i / ports.length) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * R
          const y = cy + Math.sin(angle) * R
          const lx = cx + Math.cos(angle) * (R + 16)
          const ly = cy + Math.sin(angle) * (R + 16)
          const active = i + 1 === currentPort
          return (
            <g key={i} onClick={() => !disabled && onSelect(i + 1)} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
              <circle cx={x} cy={y} r={r}
                fill={active ? '#00ff88' : 'rgba(0,0,0,0.6)'}
                stroke={active ? '#00ff88' : '#6b8aad'}
                strokeWidth={active ? 2 : 1} />
              <text x={x} y={y + 3} textAnchor="middle" fill={active ? '#080c18' : '#e8f4ff'} fontSize="9" fontWeight="700">P{i + 1}</text>
              <text x={lx} y={ly + 3} textAnchor="middle" fill={active ? '#00ff88' : '#6b8aad'} fontSize="8">{label}</text>
            </g>
          )
        })}
        {/* 中心轴 + 指针 */}
        <circle cx={cx} cy={cy} r={6} fill="#00d4ff" />
        {(() => {
          const angle = ((currentPort - 1) / ports.length) * Math.PI * 2 - Math.PI / 2
          return <line x1={cx} y1={cy} x2={cx + Math.cos(angle) * (R - r)} y2={cy + Math.sin(angle) * (R - r)} stroke="#00d4ff" strokeWidth={2.5} />
        })()}
      </svg>
    </div>
  )
}

export default function FeedingControl() {
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)

  const [pumps, setPumps] = useState<SyringeState[]>(() =>
    initSyringePumps.slice(0, 4).map(p => ({
      id: p.id, channel: p.channel, group: p.group, solvent: p.solvent,
      setpointFlow: p.flowRate, actualFlow: p.status === 'running' ? p.flowRate : 0,
      setpointVolume: 5, pushed: 0,
      pressure: p.pressure, status: 'idle',
    }))
  )

  const [valves, setValves] = useState(rotaryValves.map(v => ({ ...v })))

  // 注射泵实时模拟
  useEffect(() => {
    const id = setInterval(() => {
      setPumps(prev => prev.map(p => {
        if (p.status !== 'running') return { ...p, actualFlow: p.actualFlow * 0.7 }
        const dt = 1 / 60
        const dV = (p.actualFlow * dt) / 1000
        const newPushed = p.pushed + dV
        const newActual = p.actualFlow + (p.setpointFlow - p.actualFlow) * 0.3 + (Math.random() - 0.5) * 2
        const newPressure = 0.05 + (newActual / 200) * 0.15 + Math.random() * 0.01
        if (newPushed >= p.setpointVolume) {
          return { ...p, pushed: p.setpointVolume, actualFlow: 0, status: 'done', pressure: 0.1 }
        }
        return { ...p, pushed: newPushed, actualFlow: newActual, pressure: newPressure }
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // 天平闭环加料
  const [target, setTarget] = useState(50) // mg
  const [current, setCurrent] = useState(0) // mg
  const [dispensing, setDispensing] = useState(false)
  const [trace, setTrace] = useState<number[]>([0])
  const [vibFreq, setVibFreq] = useState(0)

  useEffect(() => {
    if (!dispensing) return
    const id = setInterval(() => {
      setCurrent(c => {
        const remaining = target - c
        if (remaining <= 0.05) {
          setDispensing(false)
          setVibFreq(0)
          pushControlLog({ user: '李工程师', device: 'BAL-01', action: '完成闭环加料', before: '0 mg', after: `${c.toFixed(2)} mg` })
          message.success(`加料完成：${c.toFixed(2)} mg / 目标 ${target} mg`)
          return c
        }
        const f = Math.max(8, Math.min(50, remaining * 0.6))
        setVibFreq(f)
        const inc = (f / 50) * 0.5 * (0.8 + Math.random() * 0.4)
        const next = c + inc
        setTrace(tr => [...tr.slice(-59), next])
        return next
      })
    }, 200)
    return () => clearInterval(id)
  }, [dispensing, target])

  const startPump = (id: string) => {
    if (estop) { message.error('系统已联锁'); return }
    setPumps(prev => prev.map(p => p.id === id ? { ...p, status: 'running', pushed: 0 } : p))
    pushControlLog({ user: '李工程师', device: id, action: '启动注液', before: 'idle', after: 'running' })
    message.success(`注射泵 ${id} 启动`)
  }
  const stopPump = (id: string) => {
    setPumps(prev => prev.map(p => p.id === id ? { ...p, status: 'idle' } : p))
    pushControlLog({ user: '李工程师', device: id, action: '停止注液', before: 'running', after: 'idle' })
  }
  const resetPump = (id: string) => {
    setPumps(prev => prev.map(p => p.id === id ? { ...p, status: 'idle', pushed: 0, actualFlow: 0 } : p))
  }

  const startDispense = () => {
    if (estop) { message.error('系统已联锁'); return }
    setCurrent(0); setTrace([0])
    setDispensing(true)
    pushControlLog({ user: '李工程师', device: 'BAL-01', action: '启动闭环加料', before: '0 mg', after: `目标 ${target} mg` })
  }

  const traceOption = {
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', textStyle: { color: '#e8f4ff' } },
    xAxis: { type: 'category' as const, data: trace.map((_, i) => i), axisLabel: { color: '#6b8aad', fontSize: 9 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value' as const, max: target * 1.1, axisLabel: { color: '#6b8aad', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [
      {
        type: 'line', data: trace, smooth: true, symbol: 'none',
        lineStyle: { color: '#00ff88', width: 2 },
        areaStyle: { color: 'rgba(0,255,136,0.15)' },
        markLine: { symbol: 'none', silent: true, lineStyle: { color: '#ff4757', type: 'dashed' as const }, data: [{ yAxis: target, label: { color: '#ff4757', fontSize: 10, formatter: `目标 ${target} mg` } }] },
      },
    ],
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16, background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...glass, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>进料与配制控制</span>
        <span style={{ color: '#6b8aad', fontSize: 12 }}>阶段 2-3 · 微量液固相分配 / 高压进样准备</span>
      </div>

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* 左 60%: 注射泵 + 多位阀 */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ ...glass, padding: 14 }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>高精度注射泵 · A 组（4 通道）</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {pumps.map(p => {
                const progress = p.setpointVolume > 0 ? Math.min(100, (p.pushed / p.setpointVolume) * 100) : 0
                return (
                  <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{p.id}</span>
                        <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>CH{p.channel} · {p.solvent}</span>
                      </div>
                      <Tag color={p.status === 'running' ? 'cyan' : p.status === 'done' ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                        {p.status === 'running' ? '注液中' : p.status === 'done' ? '完成' : '待命'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <SetpointInput
                        device={p.id}
                        label="流量"
                        unit="μL/min"
                        value={p.setpointFlow}
                        min={1} max={500} step={5}
                        disabled={estop || p.status === 'running'}
                        onCommit={v => setPumps(prev => prev.map(x => x.id === p.id ? { ...x, setpointFlow: v } : x))}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ color: '#6b8aad', fontSize: 11, minWidth: 60 }}>目标体积</span>
                      <InputNumber value={p.setpointVolume} onChange={v => setPumps(prev => prev.map(x => x.id === p.id ? { ...x, setpointVolume: v ?? 0 } : x))}
                        min={0.1} max={50} step={0.5} size="small" style={{ width: 96 }} addonAfter={<span style={{ color: '#6b8aad', fontSize: 10 }}>mL</span>} disabled={p.status === 'running'} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b8aad', marginBottom: 2 }}>
                        <span>已注 {p.pushed.toFixed(2)} / {p.setpointVolume} mL</span>
                        <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>实际 {p.actualFlow.toFixed(0)} μL/min</span>
                      </div>
                      <Progress percent={progress} showInfo={false} strokeColor={p.status === 'done' ? '#00ff88' : '#00d4ff'} trailColor="rgba(255,255,255,0.06)" size={{ height: 4 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button size="small" type="primary" ghost icon={<PlayCircleOutlined />} disabled={estop || p.status === 'running'} onClick={() => startPump(p.id)} style={{ borderColor: '#00ff88', color: '#00ff88' }}>启动</Button>
                      <Button size="small" danger icon={<PauseCircleOutlined />} disabled={p.status !== 'running'} onClick={() => stopPump(p.id)}>停止</Button>
                      <Button size="small" icon={<ReloadOutlined />} onClick={() => resetPump(p.id)}>清零</Button>
                      <span style={{ marginLeft: 'auto', color: '#6b8aad', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', alignSelf: 'center' }}>
                        P {p.pressure.toFixed(3)} MPa
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ ...glass, padding: 14, flex: 1 }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>多位切换阀（溶剂源选择）</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {valves.slice(0, 2).map(v => (
                <MultiPortValve key={v.id} id={v.id} currentPort={v.currentPort} ports={v.portMap}
                  disabled={estop}
                  onSelect={p => {
                    setValves(prev => prev.map(x => x.id === v.id ? { ...x, currentPort: p } : x))
                    pushControlLog({ user: '李工程师', device: v.id, action: '切换阀位', before: `P${v.currentPort}`, after: `P${p}` })
                    message.success(`${v.id} 切换至 P${p} (${v.portMap[p - 1]})`)
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* 右 40%: 天平闭环 */}
        <div style={{ ...glass, padding: 14, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>天平闭环加料 · 自动粉末加样仪</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 4 }}>当前重量 (BAL-01)</div>
              <div style={{ color: '#00d4ff', fontSize: 28, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {current.toFixed(2)} <span style={{ fontSize: 14, color: '#6b8aad' }}>mg</span>
              </div>
              <div style={{ color: balances[0].stable ? '#00ff88' : '#ffb800', fontSize: 10, marginTop: 4 }}>
                {balances[0].stable ? '● 稳定' : '○ 漂移'} · 皮重 {balances[0].tare} g
              </div>
            </div>
            <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 4 }}>振动频率（自适应）</div>
              <div style={{ color: '#7b61ff', fontSize: 28, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {vibFreq.toFixed(0)} <span style={{ fontSize: 14, color: '#6b8aad' }}>Hz</span>
              </div>
              <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 4 }}>
                {dispensing ? '加料中...' : '已停止'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ color: '#6b8aad', fontSize: 12 }}>目标重量</span>
            <InputNumber value={target} onChange={v => setTarget(v ?? 50)} min={1} max={1000} step={5} size="small" style={{ width: 100 }} disabled={dispensing} addonAfter={<span style={{ color: '#6b8aad', fontSize: 10 }}>mg</span>} />
            <span style={{ color: '#6b8aad', fontSize: 12 }}>原料</span>
            <Select size="small" defaultValue="Cp₂ZrCl₂" style={{ width: 140 }} disabled={dispensing} options={[
              { value: 'Cp₂ZrCl₂', label: 'Cp₂ZrCl₂' }, { value: 'Cp₂HfCl₂', label: 'Cp₂HfCl₂' }, { value: 'rac-Et(Ind)₂ZrCl₂', label: 'rac-Et(Ind)₂ZrCl₂' },
            ]} />
            <Button type="primary" icon={<PlayCircleOutlined />} disabled={dispensing || estop} onClick={startDispense}
              style={{ background: '#00ff88', borderColor: '#00ff88', color: '#080c18', fontWeight: 700, marginLeft: 'auto' }}>开始加料</Button>
            <Button danger icon={<PauseCircleOutlined />} disabled={!dispensing} onClick={() => { setDispensing(false); setVibFreq(0); pushControlLog({ user: '李工程师', device: 'BAL-01', action: '中止加料', before: 'running', after: 'idle' }) }}>中止</Button>
          </div>

          <div style={{ flex: 1, minHeight: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 8 }}>
            <ReactECharts option={traceOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, color: '#00d4ff', fontSize: 11, lineHeight: 1.6 }}>
            演示原理：加料仪根据剩余重量自适应调节振动频率。剩余 &gt; 5 mg 时高频粗加料，临近目标时降频精加料，&lt; 0.05 mg 偏差自动停止。
          </div>
        </div>
      </div>
    </div>
  )
}
