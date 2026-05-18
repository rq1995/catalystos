import { useState, useEffect, useRef, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import { motion } from 'framer-motion'
import { Select, Modal, Button, Table, Tag, Badge, Progress } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlayCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { experiments, sopLibrary } from '../../mock/data'

// ── 样式常量 ─────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

// ── 高斯峰生成 ───────────────────────────────────────────
function gaussian(x: number, mu: number, sigma: number, amp: number): number {
  return amp * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}

function generateGCData(noise = 0): { x: number[]; peaks: number[][] } {
  const xs = Array.from({ length: 91 }, (_, i) => parseFloat((i * 0.1).toFixed(1)))
  const peaks = [
    xs.map(x => gaussian(x, 3.0, 0.35, 120 + noise * (Math.random() - 0.5) * 12)),
    xs.map(x => gaussian(x, 5.0, 0.40, 160 + noise * (Math.random() - 0.5) * 12)),
    xs.map(x => gaussian(x, 7.0, 0.30, 85 + noise * (Math.random() - 0.5) * 12)),
  ]
  return { x: xs, peaks }
}

// ── 色谱 ECharts Option ──────────────────────────────────
function getGcOption(gcData: ReturnType<typeof generateGCData>) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Sample A', 'Sample B', 'Sample C'],
      textStyle: { color: '#6b8aad', fontSize: 10 },
      top: 2,
    },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: gcData.x,
      name: 'RT / min',
      nameTextStyle: { color: '#6b8aad', fontSize: 10 },
      axisLabel: { color: '#6b8aad', fontSize: 10, interval: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '强度',
      nameTextStyle: { color: '#6b8aad', fontSize: 10 },
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: 'Sample A', type: 'line', data: gcData.peaks[0],
        smooth: true, symbol: 'none',
        lineStyle: { color: '#00d4ff', width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.25)' }, { offset: 1, color: 'rgba(0,212,255,0)' }] } },
      },
      {
        name: 'Sample B', type: 'line', data: gcData.peaks[1],
        smooth: true, symbol: 'none',
        lineStyle: { color: '#00ff88', width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(0,255,136,0.2)' }, { offset: 1, color: 'rgba(0,255,136,0)' }] } },
      },
      {
        name: 'Sample C', type: 'line', data: gcData.peaks[2],
        smooth: true, symbol: 'none',
        lineStyle: { color: '#7b61ff', width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(123,97,255,0.2)' }, { offset: 1, color: 'rgba(123,97,255,0)' }] } },
      },
    ],
  }
}

// ── 温压曲线 Option ──────────────────────────────────────
function getTempPressOption(tempData: number[], pressData: number[], timeLabels: string[]) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['温度 °C', '压力 MPa'],
      textStyle: { color: '#6b8aad', fontSize: 10 },
      top: 2,
    },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: { color: '#6b8aad', fontSize: 9, interval: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value', name: '°C', min: 40, max: 80,
        nameTextStyle: { color: '#ffb800', fontSize: 10 },
        axisLabel: { color: '#ffb800', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
      },
      {
        type: 'value', name: 'MPa', min: 0.5, max: 0.75,
        nameTextStyle: { color: '#00ff88', fontSize: 10 },
        axisLabel: { color: '#00ff88', fontSize: 10 },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: '温度 °C', type: 'line', yAxisIndex: 0,
        data: tempData,
        smooth: true, symbol: 'none',
        lineStyle: { color: '#ffb800', width: 2 },
      },
      {
        name: '压力 MPa', type: 'line', yAxisIndex: 1,
        data: pressData,
        smooth: true, symbol: 'none',
        lineStyle: { color: '#00ff88', width: 2 },
      },
    ],
  }
}

// ── SOP 步骤 ─────────────────────────────────────────────
const SOP_STEPS = sopLibrary[0].steps

function SopSteps({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {SOP_STEPS.map((step, i) => {
        const isActive = i + 1 === currentStep
        const isDone = i + 1 < currentStep
        const color = isDone ? '#00ff88' : isActive ? '#00d4ff' : '#3d5168'
        return (
          <motion.div
            key={step.seq}
            initial={false}
            animate={isActive ? { scale: 1.01 } : { scale: 1 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
              background: isActive ? 'rgba(0,212,255,0.08)' : isDone ? 'rgba(0,255,136,0.04)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : isDone ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 8,
            }}
          >
            {/* 步骤圆圈 */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: isDone ? '#00ff8822' : isActive ? '#00d4ff22' : 'rgba(61,81,104,0.3)',
              border: `1.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color,
              fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
            }}>
              {isDone ? '✓' : step.seq}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: isActive ? '#e8f4ff' : isDone ? '#6b8aad' : '#3d5168', fontSize: 12, fontWeight: isActive ? 600 : 400 }}>
                {step.name}
              </div>
              {isActive && (
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2, lineHeight: 1.4 }}>{step.desc}</div>
              )}
            </div>
            {isActive && (
              <div style={{ color: '#00d4ff', fontSize: 10, flexShrink: 0 }}>
                <PlayCircleOutlined /> 执行中
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 标定表格数据 ─────────────────────────────────────────
interface CalibRecord {
  key: string
  seq: number
  id: string
  rt: number
  ara: number
  category: '正产物' | '杂质' | '中间体'
}

const calibData: CalibRecord[] = [
  { key: '1', seq: 1, id: 'PE-main', rt: 3.02, ara: 62.4, category: '正产物' },
  { key: '2', seq: 2, id: 'PP-byp', rt: 3.87, ara: 8.1, category: '杂质' },
  { key: '3', seq: 3, id: 'LLDPE-A', rt: 5.01, ara: 21.3, category: '正产物' },
  { key: '4', seq: 4, id: 'Oligomer-1', rt: 5.92, ara: 3.6, category: '中间体' },
  { key: '5', seq: 5, id: 'PE-HMW', rt: 7.03, ara: 4.2, category: '正产物' },
  { key: '6', seq: 6, id: 'Unknown-1', rt: 7.88, ara: 0.4, category: '杂质' },
]

const calibColumns: ColumnsType<CalibRecord> = [
  { title: '#', dataIndex: 'seq', width: 40, render: v => <span style={{ color: '#6b8aad', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v}</span> },
  { title: '物质标识', dataIndex: 'id', render: v => <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v}</span> },
  { title: 'RT / min', dataIndex: 'rt', render: v => <span style={{ color: '#e8f4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v.toFixed(2)}</span> },
  { title: 'Ara %', dataIndex: 'ara', render: v => <span style={{ color: '#ffb800', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v.toFixed(1)}</span> },
  {
    title: '类别', dataIndex: 'category',
    render: v => {
      const colorMap: Record<string, string> = { '正产物': '#00ff88', '杂质': '#ff4757', '中间体': '#7b61ff' }
      return <Tag style={{ background: `${colorMap[v]}18`, color: colorMap[v], border: `1px solid ${colorMap[v]}40`, fontSize: 11 }}>{v}</Tag>
    }
  },
  {
    title: '操作',
    render: () => (
      <Button
        size="small"
        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 11 }}
      >
        标记
      </Button>
    ),
  },
]

// ── S型温度曲线 ──────────────────────────────────────────
function sigmoid(t: number, tStart = 0, tEnd = 120, low = 50, high = 65): number {
  const normalized = (t - tStart) / (tEnd - tStart)
  return low + (high - low) / (1 + Math.exp(-10 * (normalized - 0.5)))
}

// ── 主页面 ───────────────────────────────────────────────
export default function ProcessMonitor() {
  const [selectedBatch, setSelectedBatch] = useState('EXP-2024-0044')
  const [selectedReactor, setSelectedReactor] = useState('R-12')
  const [gcData, setGcData] = useState(() => generateGCData(0))
  const [tempData, setTempData] = useState<number[]>([])
  const [pressData, setPressData] = useState<number[]>([])
  const [timeLabels, setTimeLabels] = useState<string[]>([])
  const [elapsedSec, setElapsedSec] = useState(0)
  const [alarmVisible, setAlarmVisible] = useState(false)
  const tickRef = useRef(0)

  // GC 实时扰动
  useEffect(() => {
    const gcTimer = setInterval(() => {
      setGcData(generateGCData(1))
    }, 800)
    return () => clearInterval(gcTimer)
  }, [])

  // 温压实时追加
  useEffect(() => {
    const tpTimer = setInterval(() => {
      const t = tickRef.current++
      const nowStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const temp = parseFloat(sigmoid(t % 120).toFixed(2))
      const press = parseFloat((0.6 + (Math.random() - 0.5) * 0.04).toFixed(3))

      setTempData(prev => {
        const next = [...prev, temp]
        return next.length > 60 ? next.slice(-60) : next
      })
      setPressData(prev => {
        const next = [...prev, press]
        return next.length > 60 ? next.slice(-60) : next
      })
      setTimeLabels(prev => {
        const next = [...prev, nowStr]
        return next.length > 60 ? next.slice(-60) : next
      })
    }, 1000)
    return () => clearInterval(tpTimer)
  }, [])

  // 运行计时器
  useEffect(() => {
    const secTimer = setInterval(() => setElapsedSec(prev => prev + 1), 1000)
    return () => clearInterval(secTimer)
  }, [])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const batchOptions = experiments.map(e => ({ value: e.id, label: e.id }))
  const reactorOptions = ['R-08', 'R-12', 'R-15', 'R-03'].map(r => ({ value: r, label: r }))

  const selectStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: '#e8f4ff',
  }

  return (
    <div style={{
      height: '100%', overflow: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ── 顶部选择栏 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ ...glass, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#6b8aad', fontSize: 12 }}>实验批次</span>
          <Select
            value={selectedBatch}
            onChange={setSelectedBatch}
            options={batchOptions}
            size="small"
            style={{ width: 180 }}
            styles={{ popup: { root: { background: '#0d1225' } } }}
          />
          <span style={{ color: '#6b8aad', fontSize: 12 }}>设备</span>
          <Select
            value={selectedReactor}
            onChange={setSelectedReactor}
            options={reactorOptions}
            size="small"
            style={{ width: 100 }}
            styles={{ popup: { root: { background: '#0d1225' } } }}
          />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge status="processing" color="#00d4ff" text={<span style={{ color: '#00d4ff', fontSize: 12 }}>实时采集中</span>} />
          <Button
            icon={<ThunderboltOutlined />}
            size="small"
            danger
            onClick={() => setAlarmVisible(true)}
            style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff4757' }}
          >
            模拟告警
          </Button>
        </div>
      </div>

      {/* ── 主区域两列 ── */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

        {/* 左列 60% */}
        <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 实时色谱 */}
          <div style={{ ...glass, padding: '14px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 10 }}>
              <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>在线色谱 (Online GC)</span>
              <span style={{ color: '#00d4ff', fontSize: 11 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, background: '#00d4ff', borderRadius: '50%', marginRight: 4, animation: 'pulse 1s infinite' }} />
                LIVE
              </span>
              <span style={{ marginLeft: 'auto', color: '#6b8aad', fontSize: 11 }}>采样间隔 800ms</span>
            </div>
            <div style={{ flex: 1, minHeight: 180 }}>
              <ReactECharts
                option={getGcOption(gcData)}
                style={{ height: '100%' }}
                notMerge={false}
                lazyUpdate={true}
              />
            </div>
          </div>

          {/* 温压曲线 */}
          <div style={{ ...glass, padding: '14px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 10 }}>
              <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>温度 / 压力实时曲线</span>
              <span style={{ marginLeft: 'auto', color: '#6b8aad', fontSize: 11 }}>最近60秒 · 1s/点</span>
            </div>
            <div style={{ flex: 1, minHeight: 160 }}>
              <ReactECharts
                option={getTempPressOption(tempData, pressData, timeLabels)}
                style={{ height: '100%' }}
                notMerge={false}
                lazyUpdate={true}
              />
            </div>
          </div>
        </div>

        {/* 右列 40% */}
        <div style={{ flex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>

          {/* 反应状态面板 */}
          <div style={{ ...glass, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600 }}>反应状态</span>
              <Tag color="success" style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.4)', color: '#00ff88', fontSize: 11 }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />执行中
              </Tag>
            </div>

            {/* 目标产物浓度 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b8aad', fontSize: 12 }}>目标产物浓度</span>
                <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700 }}>86%</span>
              </div>
              <Progress
                percent={86}
                showInfo={false}
                strokeColor={{ '0%': '#00d4ff', '100%': '#00ff88' }}
                trailColor="rgba(255,255,255,0.08)"
                size={{ height: 6 }}
              />
            </div>

            {/* 状态信息 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '反应程度', val: '正常', color: '#00ff88' },
                { label: '历史平均时间', val: '85 min', color: '#e8f4ff' },
                { label: '当前反应釜', val: selectedReactor, color: '#00d4ff' },
                { label: '操作人员', val: '李工程师', color: '#e8f4ff' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b8aad', fontSize: 12 }}>{item.label}</span>
                  <span style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600 }}>
                    {item.val}
                  </span>
                </div>
              ))}

              {/* 实时计时器 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'rgba(0,212,255,0.06)', borderRadius: 8,
                border: '1px solid rgba(0,212,255,0.2)' }}>
                <span style={{ color: '#6b8aad', fontSize: 12 }}>
                  <ClockCircleOutlined style={{ marginRight: 6 }} />当前已用时
                </span>
                <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 800 }}>
                  {formatElapsed(elapsedSec)}
                </span>
              </div>
            </div>
          </div>

          {/* SOP 步骤进度 */}
          <div style={{ ...glass, padding: '16px', flex: 1, overflow: 'auto' }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              SOP 执行进度
              <span style={{ color: '#6b8aad', fontSize: 11, fontWeight: 400, marginLeft: 8 }}>第 5/8 步</span>
            </div>
            <SopSteps currentStep={5} />
          </div>
        </div>
      </div>

      {/* ── 底部标定表格 ── */}
      <div style={{ ...glass, padding: '14px 16px' }}>
        <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          产物标定结果
          <span style={{ color: '#6b8aad', fontSize: 11, fontWeight: 400, marginLeft: 8 }}>
            {selectedBatch} · {selectedReactor}
          </span>
        </div>
        <Table
          dataSource={calibData}
          columns={calibColumns}
          pagination={false}
          size="small"
          style={{ background: 'transparent' }}
          className="calib-table"
        />
      </div>

      {/* ── 告警 Modal ── */}
      <Modal
        open={alarmVisible}
        onCancel={() => setAlarmVisible(false)}
        footer={[
          <Button key="ack" onClick={() => setAlarmVisible(false)}
            style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.5)', color: '#ff4757' }}>
            已确认联锁
          </Button>,
          <Button key="close" type="primary" onClick={() => setAlarmVisible(false)}
            style={{ background: '#00d4ff', border: 'none', color: '#080c18', fontWeight: 700 }}>
            关闭
          </Button>,
        ]}
        title={
          <span style={{ color: '#ff4757', fontSize: 16, fontWeight: 700 }}>
            <WarningOutlined style={{ marginRight: 8 }} />⚠ 安全告警触发
          </span>
        }
        styles={{
          content: { background: '#0d1225', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 12 },
          header: { background: '#0d1225', borderBottom: '1px solid rgba(255,71,87,0.2)' },
          footer: { background: '#0d1225', borderTop: '1px solid rgba(255,255,255,0.06)' },
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ color: '#ff4757', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              温度飞升告警
            </div>
            <div style={{ color: '#e8f4ff', fontSize: 13, lineHeight: 1.8 }}>
              当前温度：
              <span style={{ color: '#ff4757', fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 800 }}>
                {' '}114°C{' '}
              </span>
              超过阈值
              <span style={{ color: '#ffb800', fontFamily: "'JetBrains Mono',monospace", fontSize: 16, margin: '0 4px' }}>
                110°C
              </span>
            </div>
            <div style={{ color: '#6b8aad', fontSize: 12, marginTop: 4 }}>
              设备：{selectedReactor} · 时间：{new Date().toLocaleTimeString('zh-CN')}
            </div>
          </div>
          <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ color: '#00d4ff', fontWeight: 600, marginBottom: 6 }}>
              <CheckCircleOutlined style={{ marginRight: 6 }} />已自动触发联锁响应
            </div>
            <div style={{ color: '#6b8aad', fontSize: 12, lineHeight: 2 }}>
              ✅ 开启泄压阀<br />
              ✅ 注入终止剂（异丙醇 5 mL）<br />
              ✅ 降温至 40°C 安全阈值<br />
              ✅ 上报审计日志 LOG-EMERGENCY-{Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>
      </Modal>

      {/* 全局内联样式 */}
      <style>{`
        .calib-table .ant-table {
          background: transparent !important;
        }
        .calib-table .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.06) !important;
          color: #6b8aad !important;
          font-size: 11px;
          padding: 8px 12px;
        }
        .calib-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-color: rgba(255,255,255,0.04) !important;
          padding: 8px 12px;
        }
        .calib-table .ant-table-tbody > tr:hover > td {
          background: rgba(0,212,255,0.04) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
