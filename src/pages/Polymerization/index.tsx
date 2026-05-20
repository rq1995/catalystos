import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Button, Select, Slider, Tag, message, Modal, InputNumber, Switch } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { devices, mfcDevices, tcuDevices, torqueSensors } from '../../mock/data'
import SetpointInput from '../../components/Control/SetpointInput'
import { pushControlLog, pushAlarm, isEstopActive, subscribe } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
}

interface MfcLine {
  id: string
  gas: string
  setpoint: number
  actual: number
  totalizer: number
  history: number[]
  color: string
}

interface TcuState {
  setpoint: number
  jacket: number
  inner: number
  mode: 'heat' | 'cool' | 'auto'
  pidP: number
  pidI: number
  pidD: number
  history: { jacket: number; inner: number }[]
}

interface TorqueState {
  rpm: number
  torque: number
  threshold: number
  overload: boolean
}

const GAS_COLORS: Record<string, string> = {
  '乙烯': '#00ff88',
  '丙烯': '#00d4ff',
  '氮气': '#7b61ff',
  '氢气': '#ffb800',
}

function Gauge({ value, max, threshold, label, unit }: { value: number; max: number; threshold: number; label: string; unit: string }) {
  const overload = value > threshold
  const option = {
    series: [{
      type: 'gauge',
      min: 0, max,
      radius: '95%',
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [threshold / max, '#00ff88'],
            [1, '#ff4757'],
          ],
        },
      },
      pointer: { width: 4, length: '70%', itemStyle: { color: overload ? '#ff4757' : '#00d4ff' } },
      progress: { show: false },
      axisTick: { show: false },
      splitLine: { length: 6, lineStyle: { color: '#fff', width: 1 } },
      axisLabel: { color: '#6b8aad', fontSize: 9, distance: 12 },
      anchor: { show: true, size: 8, itemStyle: { color: '#00d4ff' } },
      title: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value} ' + unit,
        color: overload ? '#ff4757' : '#e8f4ff',
        fontSize: 16,
        fontWeight: 700,
        offsetCenter: [0, '70%'],
      },
      data: [{ value: parseFloat(value.toFixed(3)) }],
    }],
  }
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ color: '#6b8aad', fontSize: 11, position: 'absolute', top: 6, left: 6, zIndex: 1 }}>{label}</div>
      <ReactECharts option={option} style={{ height: 180 }} opts={{ renderer: 'canvas' }} />
      {overload && (
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #ff4757', borderRadius: 8, animation: 'pulseOver 0.6s ease-in-out infinite', pointerEvents: 'none' }} />
      )}
      <style>{`@keyframes pulseOver{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )
}

export default function Polymerization() {
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)
  const [params] = useSearchParams()
  const initReactor = params.get('reactor') ?? 'R-08'

  const [reactor, setReactor] = useState(initReactor)
  const [running, setRunning] = useState(true)
  const [paused, setPaused] = useState(false)

  // MFC 三路气体（取该反应釜的 MFC 主气 + 辅气合成 3 路）
  const [mfcs, setMfcs] = useState<MfcLine[]>(() => {
    const main = mfcDevices.find(m => m.reactor === reactor) ?? mfcDevices[0]
    return [
      { id: 'MFC-A', gas: main.gas === '丙烯' ? '丙烯' : '乙烯', setpoint: main.setpoint, actual: main.actual, totalizer: main.totalizer, history: Array.from({ length: 60 }, () => main.actual), color: GAS_COLORS[main.gas] || '#00ff88' },
      { id: 'MFC-B', gas: '氢气', setpoint: 0.2, actual: 0.18, totalizer: 4.2, history: Array.from({ length: 60 }, () => 0.18), color: GAS_COLORS['氢气'] },
      { id: 'MFC-C', gas: '氮气', setpoint: 1.0, actual: 0.99, totalizer: 32.5, history: Array.from({ length: 60 }, () => 0.99), color: GAS_COLORS['氮气'] },
    ]
  })

  const [tcu, setTcu] = useState<TcuState>(() => {
    const t = tcuDevices.find(x => x.reactor === reactor) ?? tcuDevices[0]
    return {
      setpoint: t.setpoint, jacket: t.jacket, inner: t.inner,
      mode: 'auto', pidP: t.pidP, pidI: t.pidI, pidD: t.pidD,
      history: Array.from({ length: 60 }, () => ({ jacket: t.jacket, inner: t.inner })),
    }
  })

  const [torque, setTorque] = useState<TorqueState>(() => {
    const tr = torqueSensors.find(x => x.reactor === reactor) ?? torqueSensors[0]
    return { rpm: tr.rpm, torque: tr.torque, threshold: tr.threshold, overload: tr.overload }
  })

  const [activity, setActivity] = useState<number[]>(() => Array.from({ length: 60 }, (_, i) => 80 + Math.sin(i * 0.2) * 20))
  const catalystMass = 0.05 // g 演示用

  // 切换反应釜时刷新数据
  useEffect(() => {
    const main = mfcDevices.find(m => m.reactor === reactor) ?? mfcDevices[0]
    const t = tcuDevices.find(x => x.reactor === reactor) ?? tcuDevices[0]
    const tr = torqueSensors.find(x => x.reactor === reactor) ?? torqueSensors[0]
    setMfcs(prev => prev.map((p, i) => i === 0 ? { ...p, setpoint: main.setpoint, actual: main.actual, totalizer: main.totalizer, gas: main.gas, color: GAS_COLORS[main.gas] || '#00ff88' } : p))
    setTcu(s => ({ ...s, setpoint: t.setpoint, jacket: t.jacket, inner: t.inner, pidP: t.pidP, pidI: t.pidI, pidD: t.pidD }))
    setTorque({ rpm: tr.rpm, torque: tr.torque, threshold: tr.threshold, overload: tr.overload })
  }, [reactor])

  // E-Stop 联锁：所有 MFC 归零，加热停止
  useEffect(() => {
    if (estop) {
      setMfcs(prev => prev.map(m => ({ ...m, setpoint: 0 })))
      setRunning(false)
    }
  }, [estop])

  // 实时模拟：一阶滞后 + PID 跟踪
  useEffect(() => {
    const id = setInterval(() => {
      setMfcs(prev => prev.map(m => {
        if (!running || paused) {
          return { ...m, actual: m.actual * 0.85 }
        }
        const next = m.actual + (m.setpoint - m.actual) * 0.25 + (Math.random() - 0.5) * 0.04
        const totalizer = m.totalizer + Math.max(0, next) * (1 / 60)
        return { ...m, actual: next, totalizer, history: [...m.history.slice(1), next] }
      }))

      setTcu(s => {
        const target = running && !paused ? s.setpoint : 25
        const jacketGain = s.mode === 'cool' ? 0.4 : s.mode === 'heat' ? 0.3 : 0.25
        const newJacket = s.jacket + (target - s.jacket) * jacketGain * (s.pidP / 2.4) + (Math.random() - 0.5) * 0.4
        const newInner = s.inner + (newJacket - s.inner) * 0.18 + (Math.random() - 0.5) * 0.2
        return {
          ...s,
          jacket: newJacket,
          inner: newInner,
          history: [...s.history.slice(1), { jacket: newJacket, inner: newInner }],
        }
      })

      setTorque(t => {
        const target = running && !paused ? 0.6 + (t.rpm / 800) : 0.05
        const next = t.torque + (target - t.torque) * 0.3 + (Math.random() - 0.5) * 0.05
        const overload = next > t.threshold
        return { ...t, torque: Math.max(0, next), overload }
      })

      setMfcs(prevMfcs => {
        setActivity(act => {
          const totalGasFlow = prevMfcs.filter(m => m.gas !== '氮气' && m.gas !== '氢气').reduce((s, m) => s + m.actual, 0)
          const inst = totalGasFlow > 0 ? (totalGasFlow * 60) / catalystMass : 0
          return [...act.slice(1), inst + (Math.random() - 0.5) * 5]
        })
        return prevMfcs
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, paused, catalystMass])

  // 扭矩超限告警
  useEffect(() => {
    if (torque.overload) {
      pushAlarm({
        level: 'critical',
        device: reactor,
        message: '搅拌扭矩 ' + torque.torque.toFixed(2) + ' Nm 超阈值 ' + torque.threshold + ' Nm，触发抱轴保护',
        action: '降速 50% 并通知运维',
        status: 'pending',
      })
    }
  }, [torque.overload])

  const updateMfcSetpoint = (id: string, value: number) => {
    setMfcs(prev => prev.map(m => m.id === id ? { ...m, setpoint: value } : m))
  }

  const triggerInterlock = () => {
    Modal.confirm({
      title: '搅拌扭矩超限联锁',
      content: '是否立即降速至 50% 并切换至冷却模式？',
      okText: '立即执行',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setTorque(t => ({ ...t, rpm: t.rpm * 0.5 }))
        setTcu(s => ({ ...s, mode: 'cool', setpoint: Math.max(25, s.setpoint - 20) }))
        pushControlLog({ user: '系统AI', device: reactor, action: '联锁降速冷却', before: '正常', after: '降速50%' })
        message.warning('已执行联锁动作：降速 + 冷却')
      },
    })
  }

  const mfcChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    legend: { data: mfcs.map(m => m.gas + ' ' + m.id), textStyle: { color: '#6b8aad', fontSize: 10 }, top: 4 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', textStyle: { color: '#e8f4ff' } },
    xAxis: { type: 'category' as const, data: mfcs[0].history.map((_, i) => (60 - i) + 's'), axisLabel: { color: '#6b8aad', fontSize: 9, interval: 14 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value' as const, name: 'SLPM', nameTextStyle: { color: '#6b8aad', fontSize: 10 }, axisLabel: { color: '#6b8aad', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: mfcs.map(m => ({
      name: m.gas + ' ' + m.id,
      type: 'line', data: m.history,
      smooth: true, symbol: 'none',
      lineStyle: { color: m.color, width: 2 },
      areaStyle: { color: m.color + '22' },
    })),
  }), [mfcs])

  const tcuChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    legend: { data: ['夹套温度', '釜内温度'], textStyle: { color: '#6b8aad', fontSize: 10 }, top: 4 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', textStyle: { color: '#e8f4ff' } },
    xAxis: { type: 'category' as const, data: tcu.history.map((_, i) => (60 - i) + 's'), axisLabel: { color: '#6b8aad', fontSize: 9, interval: 14 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value' as const, name: '°C', nameTextStyle: { color: '#6b8aad', fontSize: 10 }, axisLabel: { color: '#6b8aad', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [
      {
        name: '夹套温度', type: 'line', data: tcu.history.map(h => h.jacket), smooth: true, symbol: 'none',
        lineStyle: { color: '#ff7849', width: 2 }, areaStyle: { color: 'rgba(255,120,73,0.12)' },
        markLine: { symbol: 'none', silent: true, lineStyle: { color: '#ffb800', type: 'dashed' as const }, data: [{ yAxis: tcu.setpoint, label: { color: '#ffb800', fontSize: 10, formatter: 'SP ' + tcu.setpoint } }] },
      },
      { name: '釜内温度', type: 'line', data: tcu.history.map(h => h.inner), smooth: true, symbol: 'none', lineStyle: { color: '#ffb800', width: 2 } },
    ],
  }), [tcu])

  const activityOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    legend: { data: ['瞬时活性'], textStyle: { color: '#6b8aad', fontSize: 10 }, top: 4 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', textStyle: { color: '#e8f4ff' }, formatter: (p: { value: number }[]) => p[0].value.toFixed(1) + ' g/g·h' },
    xAxis: { type: 'category' as const, data: activity.map((_, i) => (60 - i) + 's'), axisLabel: { color: '#6b8aad', fontSize: 9, interval: 14 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value' as const, name: 'g/g·h', nameTextStyle: { color: '#6b8aad', fontSize: 10 }, axisLabel: { color: '#6b8aad', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [{
      name: '瞬时活性', type: 'line', data: activity, smooth: true, symbol: 'none',
      lineStyle: { color: '#7b61ff', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(123,97,255,0.4)' }, { offset: 1, color: 'rgba(123,97,255,0)' }] } },
    }],
  }), [activity])

  const reactorOptions = devices.slice(0, 32).map(d => ({ value: d.id, label: d.id + ' · ' + d.experiment }))

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16, background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 顶部 */}
      <div style={{ ...glass, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>聚合反应控制</span>
        <span style={{ color: '#6b8aad', fontSize: 12 }}>阶段 4 · 单体注入 + 温压同步 + 扭矩监测</span>
        <span style={{ marginLeft: 'auto', color: '#6b8aad', fontSize: 12 }}>反应釜</span>
        <Select size="small" value={reactor} onChange={setReactor} style={{ width: 240 }} options={reactorOptions} />
        <Tag color={running && !paused ? 'cyan' : paused ? 'orange' : 'default'} style={{ fontSize: 11 }}>{running ? (paused ? '暂停' : '运行中') : '停止'}</Tag>
        <Button size="small" type="primary" icon={<PlayCircleOutlined />} disabled={running || estop}
          onClick={() => { setRunning(true); setPaused(false); pushControlLog({ user: '张研究员', device: reactor, action: '启动反应', before: '停止', after: '运行' }); message.success('反应已启动') }}
          style={{ background: '#00ff88', borderColor: '#00ff88', color: '#080c18', fontWeight: 700 }}>启动</Button>
        <Button size="small" icon={<PauseCircleOutlined />} disabled={!running}
          onClick={() => { setPaused(p => !p); pushControlLog({ user: '张研究员', device: reactor, action: paused ? '恢复' : '暂停', before: paused ? '暂停' : '运行', after: paused ? '运行' : '暂停' }) }}>
          {paused ? '恢复' : '暂停'}
        </Button>
        <Button size="small" danger icon={<ThunderboltOutlined />} onClick={triggerInterlock}>联锁演示</Button>
      </div>

      {/* 2x2 网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
        {/* MFC */}
        <div style={{ ...glass, padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>MFC 质量流量 (3 路)</span>
            <span style={{ color: '#6b8aad', fontSize: 11 }}>实时 / 累计 NL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
            {mfcs.map(m => (
              <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid ' + m.color + '33', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: m.color, fontSize: 11, fontWeight: 600 }}>{m.gas}</span>
                  <span style={{ color: '#6b8aad', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{m.id}</span>
                </div>
                <div style={{ color: m.color, fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                  {m.actual.toFixed(2)} <span style={{ fontSize: 10, color: '#6b8aad' }}>SLPM</span>
                </div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 4 }}>累计 {m.totalizer.toFixed(1)} NL · SP {m.setpoint.toFixed(2)}</div>
                <div style={{ marginTop: 6 }}>
                  <SetpointInput device={m.id} label="设定" unit="SLPM" value={m.setpoint} min={0} max={5} step={0.1} disabled={estop || !running} onCommit={v => updateMfcSetpoint(m.id, v)} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={mfcChartOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>

        {/* TCU PID */}
        <div style={{ ...glass, padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>TCU 温控 PID</span>
            <Select size="small" value={tcu.mode} onChange={v => setTcu(s => ({ ...s, mode: v }))}
              options={[{ value: 'heat', label: '加热' }, { value: 'cool', label: '急冷' }, { value: 'auto', label: '自动' }]} style={{ width: 100 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'rgba(255,120,73,0.06)', border: '1px solid rgba(255,120,73,0.2)', borderRadius: 8, padding: 10 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>夹套温度</div>
              <div style={{ color: '#ff7849', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{tcu.jacket.toFixed(1)}<span style={{ fontSize: 10, color: '#6b8aad' }}> degC</span></div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 8, padding: 10 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>釜内温度</div>
              <div style={{ color: '#ffb800', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{tcu.inner.toFixed(1)}<span style={{ fontSize: 10, color: '#6b8aad' }}> degC</span></div>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, padding: 10 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>设定 SP</div>
              <div style={{ color: '#00ff88', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{tcu.setpoint}<span style={{ fontSize: 10, color: '#6b8aad' }}> degC</span></div>
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ color: '#6b8aad', fontSize: 11 }}>设定温度</span>
              <span style={{ color: '#00ff88', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{tcu.setpoint} degC</span>
            </div>
            <Slider min={0} max={120} step={1} value={tcu.setpoint} disabled={estop}
              onChange={v => setTcu(s => ({ ...s, setpoint: v }))}
              onChangeComplete={v => pushControlLog({ user: '张研究员', device: 'TCU-' + reactor.slice(2), action: '设定温度', before: tcu.setpoint, after: v as number })}
              trackStyle={{ background: '#ff7849' }} handleStyle={{ borderColor: '#ff7849' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
            {(['pidP', 'pidI', 'pidD'] as const).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#6b8aad', fontSize: 10, width: 20 }}>{k.replace('pid', '')}</span>
                <InputNumber size="small" value={tcu[k]} step={0.01} min={0} max={10} disabled={estop}
                  onChange={v => setTcu(s => ({ ...s, [k]: v ?? 0 }))} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={tcuChartOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>

        {/* 扭矩 */}
        <div style={{ ...glass, padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>搅拌扭矩 / 转速</span>
            <Tag color={torque.overload ? 'red' : 'cyan'} style={{ fontSize: 11 }}>{torque.overload ? '抱轴预警' : '正常'}</Tag>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Gauge value={torque.torque} max={2.5} threshold={torque.threshold} label="扭矩 Nm" unit="Nm" />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10 }}>
                <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 2 }}>转速 RPM</div>
                <div style={{ color: '#00d4ff', fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{torque.rpm}</div>
                <Slider min={0} max={800} step={10} value={torque.rpm} disabled={estop}
                  onChange={v => setTorque(t => ({ ...t, rpm: v }))}
                  onChangeComplete={v => pushControlLog({ user: '张研究员', device: 'TRQ-' + reactor.slice(2), action: '设定转速', before: torque.rpm, after: v as number })}
                  trackStyle={{ background: '#00d4ff' }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10 }}>
                <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 2 }}>扭矩阈值</div>
                <div style={{ color: '#ff4757', fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{torque.threshold} Nm</div>
                <InputNumber size="small" value={torque.threshold} step={0.1} min={0.5} max={3} disabled={estop}
                  onChange={v => setTorque(t => ({ ...t, threshold: v ?? 1.5 }))} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ background: torque.overload ? 'rgba(255,71,87,0.08)' : 'rgba(0,255,136,0.05)', border: '1px solid ' + (torque.overload ? '#ff4757' : '#00ff88'), borderRadius: 8, padding: 10, color: torque.overload ? '#ff4757' : '#00ff88', fontSize: 11, lineHeight: 1.6 }}>
                {torque.overload ? '联锁动作：自动降速 50% + 切冷却' : '联锁待命：超阈值后自动降速冷却'}
              </div>
            </div>
          </div>
        </div>

        {/* 瞬时活性 */}
        <div style={{ ...glass, padding: 14, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>瞬时催化活性</span>
              <span style={{ color: '#7b61ff', fontSize: 11, marginLeft: 8 }}>由单体流量积分实时反演</span>
            </div>
            <span style={{ color: '#7b61ff', fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{activity[activity.length - 1].toFixed(1)} <span style={{ fontSize: 10, color: '#6b8aad' }}>g/g·h</span></span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11, color: '#6b8aad' }}>
              催化剂 <span style={{ color: '#e8f4ff', fontFamily: 'JetBrains Mono, monospace' }}>{(catalystMass * 1000).toFixed(0)} mg</span>
            </div>
            <div style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11, color: '#6b8aad' }}>
              累计单体 <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace' }}>{mfcs[0].totalizer.toFixed(2)} NL</span>
            </div>
            <div style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11, color: '#6b8aad' }}>
              峰值 <span style={{ color: '#ffb800', fontFamily: 'JetBrains Mono, monospace' }}>{Math.max(...activity).toFixed(0)}</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={activityOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
