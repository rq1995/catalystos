import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import ReactECharts from 'echarts-for-react'
import { Button, Select, Slider, Tag, Progress, Switch, message, InputNumber } from 'antd'
import { ThunderboltOutlined, AlertOutlined } from '@ant-design/icons'
import { quenchPumps as initQuench, backPressureValves as initBpv } from '../../mock/data'
import { pushControlLog, pushAlarm, isEstopActive, subscribe } from '../../components/Control/controlBus'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
}

interface QuenchState {
  id: string
  reactor: string
  quencher: string
  targetVolume: number
  injectedVolume: number
  status: 'standby' | 'injecting' | 'done' | 'fault'
  trigger: 'manual' | 'auto' | 'idle'
}

interface BpvState {
  id: string
  reactor: string
  openPercent: number
  inletPressure: number
  outletPressure: number
  ventRate: number
  maxVentRate: number
  history: number[]
  autoProtect: boolean
}

export default function QuenchVent() {
  const estop = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)

  const [pumps, setPumps] = useState<QuenchState[]>(() => initQuench.map(q => ({
    id: q.id, reactor: q.reactor, quencher: q.quencher, targetVolume: q.targetVolume,
    injectedVolume: q.injectedVolume, status: 'standby', trigger: 'idle',
  })))

  const [bpvs, setBpvs] = useState<BpvState[]>(() => initBpv.map(b => ({
    id: b.id, reactor: b.reactor, openPercent: b.openPercent,
    inletPressure: b.inletPressure, outletPressure: b.outletPressure,
    ventRate: b.ventRate, maxVentRate: b.maxVentRate, autoProtect: true,
    history: Array.from({ length: 60 }, () => b.inletPressure),
  })))

  const [activeBpv, setActiveBpv] = useState(initBpv[0].id)

  // 注入循环
  useEffect(() => {
    const id = setInterval(() => {
      setPumps(prev => prev.map(p => {
        if (p.status !== 'injecting') return p
        const inc = 0.4 + Math.random() * 0.2
        const next = p.injectedVolume + inc
        if (next >= p.targetVolume) {
          pushControlLog({ user: '系统AI', device: p.id, action: '完成终止剂注入', before: '0 mL', after: p.targetVolume + ' mL' })
          return { ...p, injectedVolume: p.targetVolume, status: 'done' }
        }
        return { ...p, injectedVolume: next }
      }))
    }, 600)
    return () => clearInterval(id)
  }, [])

  // 背压阀实时
  useEffect(() => {
    const id = setInterval(() => {
      setBpvs(prev => prev.map(b => {
        const targetOutlet = 0.101 + (b.inletPressure - 0.101) * (1 - b.openPercent / 100) * 0.6
        const newOutlet = b.outletPressure + (targetOutlet - b.outletPressure) * 0.4 + (Math.random() - 0.5) * 0.005
        const dropRate = (b.inletPressure - newOutlet) * (b.openPercent / 100) * 0.08
        const newInlet = Math.max(0.101, b.inletPressure - dropRate + (Math.random() - 0.5) * 0.002)
        const ventRate = (b.inletPressure - newInlet) / (1 / 60)

        let nextOpen = b.openPercent
        if (b.autoProtect && ventRate > b.maxVentRate) {
          nextOpen = Math.max(0, b.openPercent - 5)
          pushAlarm({
            level: 'warning',
            device: b.id,
            message: '泄压速率 ' + ventRate.toFixed(3) + ' MPa/min 超阈值，自动收阀至 ' + nextOpen + '%',
            action: '自动收阀',
            status: 'pending',
          })
        }

        return {
          ...b,
          inletPressure: newInlet,
          outletPressure: newOutlet,
          ventRate,
          openPercent: nextOpen,
          history: [...b.history.slice(1), newInlet],
        }
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const triggerQuench = (id: string, mode: 'manual' | 'auto') => {
    if (estop) { message.error('系统已联锁'); return }
    setPumps(prev => prev.map(p => p.id === id ? { ...p, status: 'injecting', injectedVolume: 0, trigger: mode } : p))
    pushControlLog({ user: '张研究员', device: id, action: mode === 'manual' ? '手动触发终止' : '自动联锁终止', before: 'standby', after: 'injecting' })
    message.success('终止剂注入已启动 (' + id + ')')
  }

  const stopQuench = (id: string) => {
    setPumps(prev => prev.map(p => p.id === id ? { ...p, status: 'standby' } : p))
    pushControlLog({ user: '张研究员', device: id, action: '中止注入', before: 'injecting', after: 'standby' })
  }

  const updateBpv = (id: string, patch: Partial<BpvState>) => {
    setBpvs(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  const bpv = bpvs.find(b => b.id === activeBpv) ?? bpvs[0]

  const pressureChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    legend: { data: ['入口压力'], textStyle: { color: '#6b8aad', fontSize: 10 }, top: 4 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0d1525', textStyle: { color: '#e8f4ff' }, formatter: (p: { value: number }[]) => p[0].value.toFixed(3) + ' MPa' },
    xAxis: { type: 'category' as const, data: bpv.history.map((_, i) => (60 - i) + 's'), axisLabel: { color: '#6b8aad', fontSize: 9, interval: 14 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } } },
    yAxis: { type: 'value' as const, name: 'MPa', nameTextStyle: { color: '#6b8aad', fontSize: 10 }, axisLabel: { color: '#6b8aad', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } } },
    series: [{
      name: '入口压力', type: 'line', data: bpv.history, smooth: true, symbol: 'none',
      lineStyle: { color: '#ff7849', width: 2 },
      areaStyle: { color: 'rgba(255,120,73,0.15)' },
    }],
  }), [bpv])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16, background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...glass, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>终止与泄压控制</span>
        <span style={{ color: '#6b8aad', fontSize: 12 }}>阶段 5 · 终止剂注入 + 受控泄压 + 尾气回收</span>
      </div>

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* 左：终止泵 */}
        <div style={{ ...glass, padding: 14, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>终止泵 (4 路)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {pumps.map(p => {
              const progress = (p.injectedVolume / p.targetVolume) * 100
              const colorByStatus = p.status === 'injecting' ? '#ffb800' : p.status === 'done' ? '#00ff88' : '#6b8aad'
              return (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid ' + colorByStatus + '33', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{p.id}</span>
                      <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>绑定 {p.reactor}</span>
                    </div>
                    <Tag color={p.status === 'injecting' ? 'orange' : p.status === 'done' ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                      {p.status === 'injecting' ? '注入中' : p.status === 'done' ? '已完成' : '待命'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#6b8aad', fontSize: 11, minWidth: 60 }}>终止剂</span>
                    <Select size="small" value={p.quencher} disabled={p.status === 'injecting' || estop}
                      onChange={v => setPumps(prev => prev.map(x => x.id === p.id ? { ...x, quencher: v } : x))}
                      style={{ width: 140 }} options={[
                        { value: '异丙醇', label: '异丙醇' },
                        { value: 'HCl/EtOH', label: 'HCl/EtOH' },
                        { value: '水', label: '水' },
                      ]} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ color: '#6b8aad', fontSize: 11, minWidth: 60 }}>注入量</span>
                    <InputNumber size="small" value={p.targetVolume} step={0.5} min={0.5} max={50}
                      disabled={p.status === 'injecting' || estop}
                      onChange={v => setPumps(prev => prev.map(x => x.id === p.id ? { ...x, targetVolume: v ?? 5 } : x))}
                      style={{ width: 100 }} addonAfter={<span style={{ color: '#6b8aad', fontSize: 10 }}>mL</span>} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b8aad', marginBottom: 2 }}>
                      <span>已注 {p.injectedVolume.toFixed(2)} / {p.targetVolume} mL</span>
                      <span style={{ color: colorByStatus, fontFamily: 'JetBrains Mono, monospace' }}>{p.trigger === 'manual' ? '手动' : p.trigger === 'auto' ? '自动联锁' : '空闲'}</span>
                    </div>
                    <Progress percent={progress} showInfo={false} strokeColor={colorByStatus} trailColor="rgba(255,255,255,0.06)" size={{ height: 6 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="small" type="primary" icon={<ThunderboltOutlined />} disabled={estop || p.status === 'injecting'}
                      onClick={() => triggerQuench(p.id, 'manual')}
                      style={{ background: '#ffb800', borderColor: '#ffb800', color: '#080c18', fontWeight: 700 }}>手动触发</Button>
                    <Button size="small" icon={<AlertOutlined />} disabled={estop || p.status === 'injecting'}
                      onClick={() => triggerQuench(p.id, 'auto')}
                      style={{ borderColor: '#ff4757', color: '#ff4757' }}>自动联锁</Button>
                    <Button size="small" danger disabled={p.status !== 'injecting'} onClick={() => stopQuench(p.id)}>中止</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 右：背压阀 */}
        <div style={{ ...glass, padding: 14, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>背压泄放阀</span>
            <Select size="small" value={activeBpv} onChange={setActiveBpv} style={{ width: 160 }}
              options={bpvs.map(b => ({ value: b.id, label: b.id + ' · ' + b.reactor }))} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: 12, background: 'rgba(255,120,73,0.06)', border: '1px solid rgba(255,120,73,0.2)', borderRadius: 8 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>入口压力</div>
              <div style={{ color: '#ff7849', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {bpv.inletPressure.toFixed(3)} <span style={{ fontSize: 10, color: '#6b8aad' }}>MPa</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: 12, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>出口压力</div>
              <div style={{ color: '#00d4ff', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {bpv.outletPressure.toFixed(3)} <span style={{ fontSize: 10, color: '#6b8aad' }}>MPa</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: 12, background: bpv.ventRate > bpv.maxVentRate ? 'rgba(255,71,87,0.08)' : 'rgba(0,255,136,0.05)', border: '1px solid ' + (bpv.ventRate > bpv.maxVentRate ? '#ff4757' : '#00ff88'), borderRadius: 8 }}>
              <div style={{ color: '#6b8aad', fontSize: 10 }}>泄压速率</div>
              <div style={{ color: bpv.ventRate > bpv.maxVentRate ? '#ff4757' : '#00ff88', fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                {bpv.ventRate.toFixed(3)} <span style={{ fontSize: 10, color: '#6b8aad' }}>MPa/min</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b8aad', fontSize: 11 }}>阀门开度</span>
              <span style={{ color: '#00d4ff', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{bpv.openPercent.toFixed(0)} %</span>
            </div>
            <Slider min={0} max={100} step={1} value={bpv.openPercent} disabled={estop}
              onChange={v => updateBpv(bpv.id, { openPercent: v as number })}
              onChangeComplete={v => pushControlLog({ user: '张研究员', device: bpv.id, action: '设定开度', before: bpv.openPercent, after: v as number })}
              trackStyle={{ background: '#00d4ff' }} handleStyle={{ borderColor: '#00d4ff' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#6b8aad', fontSize: 11 }}>最大泄压速率</span>
            <InputNumber size="small" value={bpv.maxVentRate} min={0.01} max={0.5} step={0.01} disabled={estop}
              onChange={v => updateBpv(bpv.id, { maxVentRate: v ?? 0.05 })} style={{ width: 100 }} addonAfter={<span style={{ color: '#6b8aad', fontSize: 10 }}>MPa/min</span>} />
            <span style={{ color: '#6b8aad', fontSize: 11, marginLeft: 8 }}>自动保护</span>
            <Switch size="small" checked={bpv.autoProtect} onChange={v => updateBpv(bpv.id, { autoProtect: v })} />
          </div>

          <div style={{ flex: 1, minHeight: 160, marginBottom: 8 }}>
            <ReactECharts option={pressureChartOption} style={{ height: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>

          <div style={{ padding: 10, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 6, color: '#ff4757', fontSize: 11, lineHeight: 1.6 }}>
            安全规则：泄压速率 {'>'} {bpv.maxVentRate} MPa/min 时自动收阀 5%，避免冷激与液击；触发后 critical 告警写入告警中心。
          </div>
        </div>
      </div>
    </div>
  )
}
