import { useEffect, useState, useSyncExternalStore } from 'react'
import ReactECharts from 'echarts-for-react'
import { Button, Switch, Slider, message, Tag } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { vacuumPumps, o2h2oSensors } from '../../mock/data'
import ValveButton from '../../components/Control/ValveButton'
import { pushControlLog, pushAlarm, isEstopActive, subscribe } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
}

type ValveState = 'open' | 'closed'

interface CycleValves {
  vacuum: ValveState
  inert: ValveState
  bypass: ValveState
}

function ValveSchematic({ valves }: { valves: CycleValves }) {
  const v = (s: ValveState) => s === 'open' ? '#00ff88' : '#3d5168'
  return (
    <svg viewBox="0 0 380 220" width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6b8aad" />
        </marker>
      </defs>

      {/* 真空泵 */}
      <rect x="10" y="40" width="80" height="40" rx="4" fill="rgba(0,212,255,0.06)" stroke="#00d4ff" />
      <text x="50" y="55" textAnchor="middle" fill="#e8f4ff" fontSize="10" fontWeight="600">真空泵</text>
      <text x="50" y="70" textAnchor="middle" fill="#6b8aad" fontSize="9" fontFamily="JetBrains Mono">VP-01</text>

      {/* 氮气源 */}
      <rect x="10" y="140" width="80" height="40" rx="4" fill="rgba(0,212,255,0.06)" stroke="#00d4ff" />
      <text x="50" y="155" textAnchor="middle" fill="#e8f4ff" fontSize="10" fontWeight="600">氮气源</text>
      <text x="50" y="170" textAnchor="middle" fill="#6b8aad" fontSize="9" fontFamily="JetBrains Mono">99.999%</text>

      {/* 真空阀 */}
      <line x1="90" y1="60" x2="180" y2="60" stroke={v(valves.vacuum)} strokeWidth="2.5" />
      <circle cx="135" cy="60" r="14" fill="rgba(0,0,0,0.6)" stroke={v(valves.vacuum)} strokeWidth="2" />
      <text x="135" y="63" textAnchor="middle" fill={v(valves.vacuum)} fontSize="9" fontWeight="700">V1</text>

      {/* 氮气阀 */}
      <line x1="90" y1="160" x2="180" y2="160" stroke={v(valves.inert)} strokeWidth="2.5" />
      <circle cx="135" cy="160" r="14" fill="rgba(0,0,0,0.6)" stroke={v(valves.inert)} strokeWidth="2" />
      <text x="135" y="163" textAnchor="middle" fill={v(valves.inert)} fontSize="9" fontWeight="700">V2</text>

      {/* 汇合 → 旁通阀 */}
      <line x1="180" y1="60" x2="220" y2="60" stroke="#6b8aad" strokeWidth="2" />
      <line x1="180" y1="160" x2="220" y2="160" stroke="#6b8aad" strokeWidth="2" />
      <line x1="220" y1="60" x2="220" y2="160" stroke="#6b8aad" strokeWidth="2" />
      <line x1="220" y1="110" x2="270" y2="110" stroke={v(valves.bypass)} strokeWidth="2.5" />
      <circle cx="245" cy="110" r="14" fill="rgba(0,0,0,0.6)" stroke={v(valves.bypass)} strokeWidth="2" />
      <text x="245" y="113" textAnchor="middle" fill={v(valves.bypass)} fontSize="9" fontWeight="700">V3</text>

      {/* 反应釜组 */}
      <line x1="270" y1="110" x2="310" y2="110" stroke="#6b8aad" strokeWidth="2" markerEnd="url(#arr)" />
      <rect x="310" y="70" width="60" height="80" rx="6" fill="rgba(123,97,255,0.06)" stroke="#7b61ff" />
      <text x="340" y="105" textAnchor="middle" fill="#e8f4ff" fontSize="11" fontWeight="600">反应釜</text>
      <text x="340" y="120" textAnchor="middle" fill="#6b8aad" fontSize="9">R-01...32</text>

      {/* 旁通到尾气 */}
      <line x1="245" y1="124" x2="245" y2="200" stroke="#6b8aad" strokeWidth="1" strokeDasharray="3 3" />
      <text x="252" y="200" fill="#6b8aad" fontSize="9">→ 尾气</text>
    </svg>
  )
}

export default function Atmosphere() {
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)

  const [valves, setValves] = useState<CycleValves>({ vacuum: 'closed', inert: 'closed', bypass: 'closed' })
  const [cycling, setCycling] = useState(false)
  const [cycleStep, setCycleStep] = useState<string>('待机')
  const [cycleCount, setCycleCount] = useState(0)
  const [interlockEnabled, setInterlockEnabled] = useState(true)
  const [h2oThreshold, setH2oThreshold] = useState(1.0)

  // 双轴 H2O/O2 实时
  const [h2oData, setH2oData] = useState<number[]>(() => Array.from({ length: 60 }, () => 0.4 + Math.random() * 0.2))
  const [o2Data, setO2Data] = useState<number[]>(() => Array.from({ length: 60 }, () => 0.15 + Math.random() * 0.1))

  // 抽真空-充氮 循环
  useEffect(() => {
    if (!cycling) return
    let i = 0
    const seq: { name: string; valves: CycleValves; ms: number }[] = [
      { name: '抽真空 (V1 开 5min)', valves: { vacuum: 'open', inert: 'closed', bypass: 'open' }, ms: 3000 },
      { name: '关闭真空阀', valves: { vacuum: 'closed', inert: 'closed', bypass: 'closed' }, ms: 600 },
      { name: '充氮气 (V2 开 2min)', valves: { vacuum: 'closed', inert: 'open', bypass: 'open' }, ms: 2000 },
      { name: '关闭氮气阀', valves: { vacuum: 'closed', inert: 'closed', bypass: 'closed' }, ms: 600 },
    ]
    const tick = () => {
      const s = seq[i % seq.length]
      setCycleStep(s.name)
      setValves(s.valves)
      i++
      if (i % seq.length === 0) {
        setCycleCount(c => c + 1)
        if (i >= seq.length * 3) {
          setCycling(false)
          setCycleStep('循环完成 (3 轮)')
          pushControlLog({ user: '张研究员', device: '气氛系统', action: '完成抽真空-充氮循环', before: '运行', after: '完成' })
          message.success('已完成 3 轮抽真空-充氮置换')
          return
        }
      }
      timer = setTimeout(tick, s.ms)
    }
    let timer = setTimeout(tick, 0)
    return () => clearTimeout(timer)
  }, [cycling])

  // H2O/O2 实时刷新 + 联锁
  useEffect(() => {
    const id = setInterval(() => {
      const baseH2o = valves.vacuum === 'open' ? 0.2 : valves.inert === 'open' ? 0.4 : 0.6
      const newH2o = baseH2o + Math.random() * 0.4
      const newO2 = (baseH2o * 0.5) + Math.random() * 0.2
      setH2oData(prev => [...prev.slice(1), newH2o])
      setO2Data(prev => [...prev.slice(1), newO2])

      if (interlockEnabled && newH2o > h2oThreshold) {
        pushAlarm({
          level: 'critical',
          device: 'GAS-01',
          message: `H₂O ${newH2o.toFixed(2)} ppm 超阈值 ${h2oThreshold} ppm，闭锁所有进料阀`,
          action: '已自动联锁',
          status: 'pending',
        })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [valves, interlockEnabled, h2oThreshold])

  const startCycle = () => {
    if (estop) { message.error('系统已联锁，无法启动'); return }
    setCycling(true)
    setCycleCount(0)
    pushControlLog({ user: '张研究员', device: '气氛系统', action: '启动抽真空-充氮循环', before: '待机', after: '运行 3 轮' })
    message.info('已启动 3 轮置换循环')
  }

  const stopCycle = () => {
    setCycling(false)
    setValves({ vacuum: 'closed', inert: 'closed', bypass: 'closed' })
    setCycleStep('已停止')
    pushControlLog({ user: '张研究员', device: '气氛系统', action: '中止置换循环', before: '运行', after: '停止' })
  }

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', borderColor: 'rgba(255,255,255,0.08)', textStyle: { color: '#e8f4ff' } },
    legend: { data: ['H₂O (ppm)', 'O₂ (ppm)'], textStyle: { color: '#6b8aad', fontSize: 10 }, top: 4 },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: { type: 'category' as const, data: h2oData.map((_, i) => `${60 - i}s`), axisLabel: { color: '#6b8aad', fontSize: 9, interval: 14 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: [
      { type: 'value' as const, name: 'H₂O', nameTextStyle: { color: '#00d4ff', fontSize: 10 }, axisLabel: { color: '#00d4ff', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
      { type: 'value' as const, name: 'O₂', nameTextStyle: { color: '#7b61ff', fontSize: 10 }, axisLabel: { color: '#7b61ff', fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: 'H₂O (ppm)', type: 'line', yAxisIndex: 0, data: h2oData, smooth: true, symbol: 'none', lineStyle: { color: '#00d4ff', width: 2 },
        markLine: interlockEnabled ? { symbol: 'none', silent: true, lineStyle: { color: '#ff4757', type: 'dashed' as const }, data: [{ yAxis: h2oThreshold, label: { color: '#ff4757', fontSize: 10, formatter: `阈值 ${h2oThreshold}` } }] } : undefined },
      { name: 'O₂ (ppm)', type: 'line', yAxisIndex: 1, data: o2Data, smooth: true, symbol: 'none', lineStyle: { color: '#7b61ff', width: 2 } },
    ],
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16, background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top */}
      <div style={{ ...glass, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>气氛与水氧控制</span>
        <span style={{ color: '#6b8aad', fontSize: 12 }}>阶段 1 · 严格水氧隔绝</span>
        <span style={{ marginLeft: 'auto', color: '#6b8aad', fontSize: 12 }}>当前步骤</span>
        <Tag color={cycling ? 'processing' : 'default'} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{cycleStep}</Tag>
        {cycling && <span style={{ color: '#00d4ff', fontSize: 12 }}>第 {cycleCount + 1}/3 轮</span>}
      </div>

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* 左：阀门时序 */}
        <div style={{ ...glass, padding: 16, flex: '0 0 36%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>阀门时序面板</div>
          <ValveSchematic valves={valves} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <ValveButton id="VP-V1" name="真空阀" type="vacuum" state={valves.vacuum} disabled={cycling || estop} onToggle={s => { setValves(v => ({ ...v, vacuum: s })) }} compact />
            <ValveButton id="VP-V2" name="氮气阀" type="inert" state={valves.inert} disabled={cycling || estop} onToggle={s => { setValves(v => ({ ...v, inert: s })) }} compact />
            <ValveButton id="VP-V3" name="旁通阀" type="bypass" state={valves.bypass} disabled={cycling || estop} onToggle={s => { setValves(v => ({ ...v, bypass: s })) }} compact />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startCycle}
              disabled={cycling || estop}
              style={{ background: '#00ff88', borderColor: '#00ff88', color: '#080c18', fontWeight: 700 }}
            >
              启动循环 3 次
            </Button>
            <Button
              icon={<PauseCircleOutlined />}
              danger
              onClick={stopCycle}
              disabled={!cycling}
            >
              中止
            </Button>
          </div>
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 6, color: '#ffb800', fontSize: 11, lineHeight: 1.6 }}>
            标准时序：抽真空 5min → 充氮 2min，重复 3 次。<br />
            演示加速：每步 0.6~3 秒。
          </div>
        </div>

        {/* 中：H2O/O2 趋势 */}
        <div style={{ ...glass, padding: 16, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            H₂O / O₂ 实时趋势
            <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>最近 60s · 1s/点</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            {o2h2oSensors.map(s => (
              <div key={s.id} style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#6b8aad', fontSize: 10 }}>{s.location} · {s.id}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>H₂O {s.h2o.toFixed(2)} ppm</span>
                  <span style={{ color: '#7b61ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>O₂ {s.o2.toFixed(2)} ppm</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={trendOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>

        {/* 右：联锁规则 + 真空泵 */}
        <div style={{ flex: '0 0 22%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...glass, padding: 16 }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>联锁规则</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#6b8aad', fontSize: 12 }}>启用 H₂O 联锁</span>
              <Switch checked={interlockEnabled} onChange={setInterlockEnabled} size="small" />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b8aad', fontSize: 11 }}>H₂O 阈值</span>
                <span style={{ color: '#ff4757', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600 }}>{h2oThreshold.toFixed(1)} ppm</span>
              </div>
              <Slider min={0.1} max={5} step={0.1} value={h2oThreshold} onChange={setH2oThreshold} disabled={!interlockEnabled}
                trackStyle={{ background: '#ff4757' }} handleStyle={{ borderColor: '#ff4757' }} />
            </div>
            <div style={{ padding: 8, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 6, color: '#ff4757', fontSize: 11, lineHeight: 1.6 }}>
              当 H₂O &gt; 阈值时：<br />
              · 关闭所有进料阀<br />
              · 推送 critical 告警<br />
              · 闭锁后续合成动作
            </div>
          </div>

          <div style={{ ...glass, padding: 16, flex: 1 }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>真空泵</div>
            {vacuumPumps.map(p => (
              <div key={p.id} style={{ marginBottom: 10, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                  <Tag color={p.status === 'running' ? 'cyan' : 'default'} style={{ margin: 0, fontSize: 10 }}>{p.status === 'running' ? '运行' : '待机'}</Tag>
                </div>
                <div style={{ color: '#6b8aad', fontSize: 11 }}>
                  真空度 <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>{p.vacuumLevel} Pa</span>
                </div>
                <div style={{ color: '#6b8aad', fontSize: 11 }}>
                  累计运行 <span style={{ color: '#e8f4ff', fontFamily: 'JetBrains Mono, monospace' }}>{p.runtime.toFixed(1)} h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
