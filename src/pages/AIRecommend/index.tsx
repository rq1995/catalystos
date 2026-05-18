import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Button, Form, InputNumber, Select, Modal, message, Tag, Tooltip,
  Space, Typography, Divider
} from 'antd'
import {
  CheckOutlined, EditOutlined, CloseOutlined, StarFilled,
  ThunderboltOutlined, ExperimentOutlined, RobotOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { motion } from 'framer-motion'

const { Text, Title } = Typography

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
  borderRadius: 12,
  padding: '16px',
  backdropFilter: 'blur(12px)',
}

// ── 分子结构 Canvas ────────────────────────────────────
function MoleculeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 280
    canvas.height = 200
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 画茂环 (Cp₂) - 左环
    const drawCp = (cx: number, cy: number, r: number) => {
      const pts: [number, number][] = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
      }
      ctx.beginPath()
      ctx.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < 5; i++) ctx.lineTo(pts[i][0], pts[i][1])
      ctx.closePath()
      ctx.strokeStyle = CYAN
      ctx.lineWidth = 1.5
      ctx.stroke()
      // 内圆 (芳香性)
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.5, 0, 2 * Math.PI)
      ctx.strokeStyle = `${CYAN}80`
      ctx.lineWidth = 1
      ctx.stroke()
      // C 原子
      for (const [x, y] of pts) {
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, 2 * Math.PI)
        ctx.fillStyle = '#aee'
        ctx.fill()
      }
    }

    // 左 Cp 环
    drawCp(70, 90, 32)
    // 右 Cp 环
    drawCp(210, 90, 32)

    // Zr 中心
    const zrX = 140, zrY = 100
    ctx.beginPath()
    ctx.arc(zrX, zrY, 10, 0, 2 * Math.PI)
    ctx.fillStyle = PURPLE
    ctx.fill()
    ctx.fillStyle = TEXT
    ctx.font = 'bold 9px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Zr', zrX, zrY)

    // η⁵ 配位线 (左)
    ctx.setLineDash([3, 2])
    ctx.strokeStyle = `${CYAN}90`
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const ex = 70 + 32 * Math.cos(angle)
      const ey = 90 + 32 * Math.sin(angle)
      ctx.beginPath()
      ctx.moveTo(zrX, zrY)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }
    // η⁵ 配位线 (右)
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const ex = 210 + 32 * Math.cos(angle)
      const ey = 90 + 32 * Math.sin(angle)
      ctx.beginPath()
      ctx.moveTo(zrX, zrY)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Cl 配体
    const clPositions: [number, number, string][] = [
      [140, 130, 'Cl'],
      [140, 70, 'Cl'],
    ]
    for (const [x, y, label] of clPositions) {
      ctx.beginPath()
      ctx.moveTo(zrX, zrY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = `${WARN}80`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = `${WARN}30`
      ctx.fill()
      ctx.strokeStyle = WARN
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = WARN
      ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, x, y)
    }

    // η⁵ 标注
    ctx.fillStyle = `${CYAN}cc`
    ctx.font = '10px serif'
    ctx.textAlign = 'center'
    ctx.fillText('η⁵', 70, 48)
    ctx.fillText('η⁵', 210, 48)

    // 化合物名称
    ctx.fillStyle = TEXT
    ctx.font = 'bold 12px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Cp₂ZrCl₂', 140, 175)
    ctx.fillStyle = MUTED
    ctx.font = '10px sans-serif'
    ctx.fillText('茂金属催化剂', 140, 192)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}
    />
  )
}

// ── SHAP 图 ──────────────────────────────────────────
function ShapChart() {
  const shapData = [
    { name: 'Al/Zr比', value: 0.42 },
    { name: '温度', value: 0.31 },
    { name: '配体骨架', value: 0.24 },
    { name: '压力', value: 0.15 },
    { name: '共单体比', value: -0.12 },
    { name: '金属中心', value: 0.09 },
  ]

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 8, bottom: 30, left: 80, right: 60 },
    xAxis: {
      type: 'value',
      axisLabel: { color: MUTED, fontSize: 10 },
      splitLine: { lineStyle: { color: BORDER } },
      axisLine: { lineStyle: { color: BORDER } },
      name: 'SHAP值',
      nameTextStyle: { color: MUTED, fontSize: 10 },
    },
    yAxis: {
      type: 'category',
      data: shapData.map(d => d.name).reverse(),
      axisLabel: { color: TEXT, fontSize: 11 },
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: shapData.slice().reverse().map(d => ({
        value: d.value,
        itemStyle: { color: d.value >= 0 ? CYAN : DANGER, borderRadius: [0, 4, 4, 0] }
      })),
      label: {
        show: true,
        position: 'right',
        color: TEXT,
        fontSize: 10,
        formatter: (p: any) => (p.value >= 0 ? '+' : '') + p.value.toFixed(2),
      },
      barMaxWidth: 16,
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,12,24,0.95)',
      borderColor: BORDER,
      textStyle: { color: TEXT },
    },
  }

  return <ReactECharts option={option} style={{ height: 180 }} />
}

// ── 迭代对比图 ──────────────────────────────────────────
function IterationChart() {
  const option = {
    backgroundColor: 'transparent',
    grid: { top: 16, bottom: 30, left: 50, right: 20 },
    xAxis: {
      type: 'category',
      data: ['第1轮', '第2轮', '第3轮', '第4轮(预)'],
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'kg/mol·h',
      nameTextStyle: { color: MUTED, fontSize: 9 },
      axisLabel: { color: MUTED, fontSize: 10 },
      splitLine: { lineStyle: { color: BORDER } },
      axisLine: { lineStyle: { color: BORDER } },
      min: 6000,
    },
    series: [{
      type: 'line',
      data: [7240, 8120, 9240, 10400],
      smooth: true,
      lineStyle: { color: CYAN, width: 2 },
      itemStyle: { color: CYAN },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${CYAN}40` }, { offset: 1, color: `${CYAN}00` }] } },
      markPoint: {
        data: [{ type: 'max', name: '最优', itemStyle: { color: GREEN } }],
        symbol: 'pin',
        symbolSize: 28,
        label: { color: '#000', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' },
      },
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,12,24,0.95)',
      borderColor: BORDER,
      textStyle: { color: TEXT, fontFamily: 'JetBrains Mono, monospace' },
      formatter: (p: any) => `${p[0].name}<br/>最优活性: <b>${p[0].value.toLocaleString()}</b> kg/mol·h`,
    },
  }

  return <ReactECharts option={option} style={{ height: 160 }} />
}

// ── 贝叶斯热力图 ──────────────────────────────────────────
function BayesHeatmap() {
  const temps = [50, 55, 60, 65, 70, 75, 80]
  const ratios = [400, 550, 700, 850, 1000, 1100, 1200]

  // mock 活性热力图数据
  const data: [number, number, number][] = []
  for (let ti = 0; ti < temps.length; ti++) {
    for (let ri = 0; ri < ratios.length; ri++) {
      const tNorm = (temps[ti] - 65) / 15
      const rNorm = (ratios[ri] - 850) / 400
      const val = 9240 * Math.exp(-0.4 * (tNorm * tNorm + rNorm * rNorm)) + Math.random() * 500
      data.push([ti, ri, Math.round(val)])
    }
  }

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 40, bottom: 60, left: 70, right: 120 },
    xAxis: {
      type: 'category',
      data: temps.map(t => `${t}°C`),
      name: '聚合温度',
      nameLocation: 'middle',
      nameGap: 36,
      nameTextStyle: { color: MUTED },
      axisLabel: { color: TEXT, fontSize: 11 },
      axisLine: { lineStyle: { color: BORDER } },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'category',
      data: ratios.map(r => `${r}`),
      name: 'Al/Zr 比',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { color: MUTED },
      axisLabel: { color: TEXT, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
      axisLine: { lineStyle: { color: BORDER } },
      splitArea: { show: false },
    },
    visualMap: {
      min: 4000,
      max: 10000,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: TEXT, fontSize: 10 },
      inRange: { color: ['#0d2137', '#0a4a6e', CYAN, WARN, '#ff6b35', DANGER] },
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: CYAN } },
      markPoint: {
        data: [{
          coord: [3, 3],
          name: '当前推荐',
          symbol: 'star',
          symbolSize: 20,
          itemStyle: { color: '#fff', borderColor: CYAN, borderWidth: 2 },
          label: { show: false },
        }],
      },
    }],
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(8,12,24,0.95)',
      borderColor: BORDER,
      textStyle: { color: TEXT, fontFamily: 'JetBrains Mono, monospace' },
      formatter: (p: any) => {
        const [ti, ri, v] = p.data
        return `温度: ${temps[ti]}°C | Al/Zr: ${ratios[ri]}<br/>预测活性: <b>${v.toLocaleString()}</b> kg/mol·h`
      },
    },
  }

  return <ReactECharts option={option} style={{ height: 300 }} />
}

// ── 指标卡片 ──────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string
  unit?: string
  color?: string
  ci?: string
  delta?: string
}

function MetricCard({ label, value, unit, color = CYAN, ci, delta }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        ...cardStyle,
        padding: '14px 16px',
        borderLeft: `3px solid ${color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${color}15, transparent)` }} />
      <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: MUTED, fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </div>
      {ci && <div style={{ color: MUTED, fontSize: 10, marginTop: 4 }}>置信区间: {ci}</div>}
      {delta && <div style={{ color: GREEN, fontSize: 11, marginTop: 2 }}>{delta}</div>}
    </motion.div>
  )
}

// ── 主页面 ──────────────────────────────────────────
export default function AIRecommend() {
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [msgApi, contextHolder] = message.useMessage()

  const handleApprove = useCallback(() => {
    msgApi.success({
      content: '工单 WO-20240518-048 已生成',
      duration: 4,
      icon: <CheckOutlined style={{ color: GREEN }} />,
      style: { background: '#0a1a0f', border: `1px solid ${GREEN}`, borderRadius: 8 },
    })
  }, [msgApi])

  const handleEdit = useCallback(() => {
    setEditing(true)
    form.setFieldsValue({ temp: 65, pressure: 0.6, alZrRatio: 850, duration: 90, comonomer: '1-己烯', comonomerRatio: 0.15 })
  }, [form])

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) {
      msgApi.warning('请填写驳回原因')
      return
    }
    setRejectModalOpen(false)
    setRejectReason('')
    msgApi.info('已驳回并记录原因')
  }, [rejectReason, msgApi])

  const similarCatalysts = [
    { id: 'CAT-2024-0041', sim: 95, name: 'rac-Et(Ind)₂ZrCl₂' },
    { id: 'CAT-2024-0035', sim: 87, name: 'Cp₂ZrCl₂/MAO' },
    { id: 'CAT-2024-0028', sim: 82, name: 'Me₂Si(Cp)₂ZrCl₂' },
  ]

  return (
    <div style={{ background: BG, minHeight: '100%', padding: '0 0 24px', color: TEXT, fontFamily: 'system-ui, sans-serif' }}>
      {contextHolder}

      {/* 顶部状态条 */}
      <div style={{
        background: `linear-gradient(90deg, ${PURPLE}20, ${CYAN}15, transparent)`,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${PURPLE}`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <RobotOutlined style={{ color: PURPLE, fontSize: 20 }} />
        <div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: CYAN, fontWeight: 700, fontSize: 14 }}>REP-2024-0847</span>
          <span style={{ color: MUTED, fontSize: 12, marginLeft: 12 }}>2024-05-18 10:42:16</span>
        </div>
        <Tag color={PURPLE} style={{ borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
          AI已完成贝叶斯优化第3轮
        </Tag>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['优化轮次: 3/5', '候选方案: 12', '收敛置信: 87%'].map(t => (
            <Tag key={t} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 8 }}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* 主三列区域 */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 20px', alignItems: 'flex-start' }}>

        {/* 左列 30% */}
        <div style={{ flex: '0 0 30%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExperimentOutlined style={{ color: CYAN }} />
            推荐催化剂结构
          </div>

          {/* 分子结构卡片 */}
          <div style={{ ...cardStyle, background: 'rgba(0,212,255,0.03)', borderColor: `${CYAN}30` }}>
            <MoleculeCanvas />
          </div>

          {/* 参数信息 */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: MUTED, fontSize: 10, marginBottom: 4 }}>SMILES</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: CYAN,
                background: 'rgba(0,212,255,0.06)',
                border: `1px solid ${CYAN}30`,
                borderRadius: 6,
                padding: '6px 8px',
                wordBreak: 'break-all',
                cursor: 'text',
                userSelect: 'all',
              }}>
                Cl[Zr](Cl)(η⁵-Cp)(η⁵-Cp)
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '金属中心', value: 'Zr', color: PURPLE },
                { label: '助催化剂', value: 'MAO', color: WARN },
                { label: '配体类型', value: '茂环', color: CYAN },
                { label: '对称性', value: 'C₂ᵥ', color: GREEN },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 8px' }}>
                  <div style={{ color: MUTED, fontSize: 10 }}>{label}</div>
                  <div style={{ color, fontWeight: 600, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 相似催化剂 */}
          <div style={cardStyle}>
            <div style={{ color: MUTED, fontSize: 11, marginBottom: 10 }}>相似催化剂（来自知识库）</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {similarCatalysts.map((cat, i) => (
                <div key={cat.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px',
                  border: `1px solid ${i === 0 ? `${CYAN}30` : BORDER}`,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `conic-gradient(${CYAN} ${cat.sim}%, rgba(255,255,255,0.08) 0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, color: CYAN, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{cat.sim}%</span>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: TEXT, fontSize: 12, fontWeight: 500 }}>{cat.name}</div>
                    <div style={{ color: MUTED, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{cat.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中列 35% */}
        <div style={{ flex: '0 0 35%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThunderboltOutlined style={{ color: WARN }} />
            推荐工艺参数
          </div>

          <div style={cardStyle}>
            <Form
              form={form}
              layout="horizontal"
              initialValues={{
                temp: 65, pressure: 0.6, alZrRatio: 850,
                duration: 90, comonomer: '1-己烯', comonomerRatio: 0.15
              }}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              size="small"
            >
              {[
                { label: '聚合温度', name: 'temp', unit: '°C', min: 40, max: 100, step: 1 },
                { label: '聚合压力', name: 'pressure', unit: 'MPa', min: 0.1, max: 2, step: 0.1 },
                { label: 'Al/Zr 比', name: 'alZrRatio', unit: '', min: 100, max: 2000, step: 10 },
                { label: '反应时长', name: 'duration', unit: 'min', min: 10, max: 300, step: 5 },
              ].map(({ label, name, unit, min, max, step }) => (
                <Form.Item
                  key={name}
                  label={<span style={{ color: MUTED, fontSize: 12 }}>{label}</span>}
                  name={name}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    disabled={!editing}
                    min={min} max={max} step={step}
                    style={{
                      width: '100%',
                      background: editing ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${editing ? CYAN + '50' : BORDER}`,
                      color: TEXT,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    addonAfter={unit ? <span style={{ color: MUTED, fontSize: 10 }}>{unit}</span> : undefined}
                    controls={editing}
                  />
                </Form.Item>
              ))}
              <Form.Item
                label={<span style={{ color: MUTED, fontSize: 12 }}>共单体</span>}
                name="comonomer"
                style={{ marginBottom: 8 }}
              >
                <Select
                  disabled={!editing}
                  options={['1-己烯', '1-丁烯', '1-辛烯', '丙烯'].map(v => ({ label: v, value: v }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: MUTED, fontSize: 12 }}>共单体进料比</span>}
                name="comonomerRatio"
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  disabled={!editing}
                  min={0} max={1} step={0.01}
                  style={{
                    width: '100%',
                    background: editing ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${editing ? CYAN + '50' : BORDER}`,
                    color: TEXT,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  controls={editing}
                />
              </Form.Item>
            </Form>
          </div>

          {/* SHAP 图 */}
          <div style={cardStyle}>
            <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>SHAP 特征重要性</div>
            <ShapChart />
          </div>
        </div>

        {/* 右列 35% */}
        <div style={{ flex: '0 0 35%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarFilled style={{ color: GREEN }} />
            预测性能指标
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MetricCard
              label="催化活性"
              value="9,240"
              unit="kg/mol·h"
              color={CYAN}
              ci="[8,640 ~ 9,890]"
              delta="▲ 超历史均值 +23%"
            />
            <MetricCard
              label="PDI 区间"
              value="2.0 ~ 2.3"
              color={PURPLE}
              ci="95% 置信区间"
              delta="▲ 单峰分布"
            />
            <MetricCard
              label="熔点 Tm"
              value="136"
              unit="°C"
              color={WARN}
              ci="[134.1 ~ 137.8]"
              delta="▲ 高结晶度"
            />
            <MetricCard
              label="共单体插入率"
              value="8.2"
              unit="%"
              color={GREEN}
              ci="[7.8% ~ 8.6%]"
              delta="▲ 符合LLDPE规格"
            />
          </div>

          {/* 迭代对比图 */}
          <div style={cardStyle}>
            <div style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>贝叶斯迭代优化 — 最优活性趋势</div>
            <IterationChart />
          </div>
        </div>
      </div>

      {/* 底部全宽区域 */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 热力图 */}
        <div style={cardStyle}>
          <div style={{ color: TEXT, fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, background: CYAN, borderRadius: '50%', display: 'inline-block' }} />
            贝叶斯参数空间热力图
            <Tag style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 10 }}>
              ★ = 当前推荐点 (65°C, Al/Zr=850)
            </Tag>
          </div>
          <BayesHeatmap />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button
            size="large"
            icon={<CheckOutlined />}
            onClick={handleApprove}
            style={{
              flex: 1, maxWidth: 280, height: 48,
              background: `linear-gradient(135deg, ${GREEN}20, ${GREEN}10)`,
              border: `1px solid ${GREEN}60`,
              color: GREEN, fontWeight: 600, fontSize: 14, borderRadius: 10,
            }}
          >
            一键同意，生成工单
          </Button>
          <Button
            size="large"
            icon={<EditOutlined />}
            onClick={handleEdit}
            style={{
              flex: 1, maxWidth: 280, height: 48,
              background: `linear-gradient(135deg, ${CYAN}20, ${CYAN}10)`,
              border: `1px solid ${CYAN}60`,
              color: CYAN, fontWeight: 600, fontSize: 14, borderRadius: 10,
            }}
          >
            修改参数后执行
          </Button>
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={() => setRejectModalOpen(true)}
            style={{
              flex: 1, maxWidth: 280, height: 48,
              background: `linear-gradient(135deg, ${DANGER}20, ${DANGER}10)`,
              border: `1px solid ${DANGER}60`,
              color: DANGER, fontWeight: 600, fontSize: 14, borderRadius: 10,
            }}
          >
            驳回并备注
          </Button>
        </div>
      </div>

      {/* 驳回 Modal */}
      <Modal
        title={<span style={{ color: DANGER }}>驳回并备注原因</span>}
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => setRejectModalOpen(false)}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        styles={{
          content: { background: '#0d1425', border: `1px solid ${BORDER}` },
          header: { background: '#0d1425', borderBottom: `1px solid ${BORDER}` },
          body: { background: '#0d1425' },
          footer: { background: '#0d1425', borderTop: `1px solid ${BORDER}` },
        }}
      >
        <div style={{ marginBottom: 8, color: MUTED, fontSize: 12 }}>请说明驳回原因，以便 AI 系统学习优化：</div>
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="例如：参数超出设备安全范围 / 目标产品规格变更..."
          rows={5}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            color: TEXT,
            padding: '10px 12px',
            fontSize: 13,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
        />
      </Modal>
    </div>
  )
}
