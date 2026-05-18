import React, { useState, useMemo } from 'react'
import { Button, Select, Switch, Table, Tag, Tooltip } from 'antd'
import {
  DownloadOutlined, RobotOutlined, StarFilled, StarOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

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
const ORANGE = '#ff7b35'

const cardStyle: React.CSSProperties = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  padding: '12px 14px',
  backdropFilter: 'blur(12px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}

// ── 高斯峰 mock 数据生成器 ──────────────────────────────────────────
function gaussian(x: number, center: number, width: number, height: number): number {
  return height * Math.exp(-0.5 * ((x - center) / width) ** 2)
}

// GPC mock
function makeGPCData() {
  const x = Array.from({ length: 200 }, (_, i) => 15 + i * 0.1)
  const ri = x.map(v => gaussian(v, 23, 2.5, 850) + Math.random() * 15)
  const malls = x.map(v => gaussian(v, 22.5, 3, 640) + Math.random() * 12)
  return { x, ri, malls }
}

// DSC mock
function makeDSCData() {
  const x = Array.from({ length: 260 }, (_, i) => 50 + i * 0.5)
  const y = x.map(v => {
    let val = -0.05
    // 结晶峰（放热，110°C，向上）
    val += gaussian(v, 108.4, 4, 0.45)
    // 熔融峰（吸热，135°C，向下）
    val -= gaussian(v, 135.2, 3.5, 0.9)
    return val + (Math.random() - 0.5) * 0.008
  })
  return { x, y }
}

// NMR mock
function makeNMRData() {
  const x = Array.from({ length: 800 }, (_, i) => i * 0.01)
  const y = x.map(v => {
    let val = 0
    // δ=0.9 主甲基峰
    val += gaussian(v, 0.9, 0.05, 100) + gaussian(v, 0.89, 0.03, 60)
    // δ=1.3 亚甲基
    val += gaussian(v, 1.3, 0.08, 55) + gaussian(v, 1.28, 0.04, 30)
    // δ=1.9/2.1 共单体峰
    val += gaussian(v, 1.9, 0.04, 18) + gaussian(v, 2.1, 0.04, 14)
    // 基线噪声
    val += (Math.random() - 0.5) * 1.5
    return Math.max(0, val)
  })
  return { x, y }
}

// FTIR mock
function makeFTIRData() {
  const x = Array.from({ length: 350 }, (_, i) => 500 + i * 10)
  const y = x.map(v => {
    let t = 92 // 透射率基线
    // CH₂ 伸缩 2920 / 2850
    t -= gaussian(v, 2920, 20, 35)
    t -= gaussian(v, 2850, 15, 28)
    // 弯曲 1460
    t -= gaussian(v, 1460, 15, 22)
    // 摇摆 720
    t -= gaussian(v, 720, 12, 18)
    // 1380 CH₃
    t -= gaussian(v, 1380, 10, 12)
    return Math.max(0, Math.min(100, t + (Math.random() - 0.5) * 1.5))
  })
  return { x, y }
}

// ── GPC 图表 ──────────────────────────────────────────
function GPCChart({ compare }: { compare: boolean }) {
  const { x, ri, malls } = useMemo(makeGPCData, [])
  const { ri: ri2, malls: malls2 } = useMemo(makeGPCData, [])

  const commonTooltip = {
    trigger: 'axis' as const,
    backgroundColor: 'rgba(8,12,24,0.96)',
    borderColor: BORDER,
    textStyle: { color: TEXT, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 },
  }

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'PDI = 2.1   Mn = 4.82×10⁴   Mw = 1.01×10⁵',
      textStyle: { color: MUTED, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
      top: 4, left: 'center',
    },
    grid: { top: 40, bottom: 48, left: 55, right: 55 },
    xAxis: {
      type: 'value' as const,
      name: '洗脱体积 (mL)',
      nameLocation: 'middle' as const,
      nameGap: 28,
      nameTextStyle: { color: MUTED, fontSize: 10 },
      min: 15, max: 35,
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}80` } },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: 'RI (mV)',
        nameTextStyle: { color: CYAN, fontSize: 10 },
        axisLabel: { color: MUTED, fontSize: 10 },
        axisLine: { lineStyle: { color: CYAN + '40' } },
        splitLine: { lineStyle: { color: `${BORDER}50` } },
      },
      {
        type: 'value' as const,
        name: 'MALLS (mV)',
        nameTextStyle: { color: PURPLE, fontSize: 10 },
        axisLabel: { color: MUTED, fontSize: 10 },
        axisLine: { lineStyle: { color: PURPLE + '40' } },
        splitLine: { show: false },
      },
    ],
    legend: {
      data: compare
        ? ['RI信号 #1', 'MALLS #1', 'RI信号 #2', 'MALLS #2']
        : ['RI信号', 'MALLS信号'],
      textStyle: { color: MUTED, fontSize: 10 },
      top: 20, right: 10,
    },
    series: [
      {
        name: compare ? 'RI信号 #1' : 'RI信号',
        type: 'line',
        yAxisIndex: 0,
        data: x.map((v, i) => [v, ri[i]]),
        lineStyle: { color: CYAN, width: 1.5 },
        symbol: 'none',
        markLine: {
          silent: true,
          lineStyle: { color: `${CYAN}80`, type: 'dashed' },
          data: [
            { xAxis: 24.2, name: 'Mn', label: { color: CYAN, fontSize: 9, formatter: 'Mn=48200' } },
            { xAxis: 21.8, name: 'Mw', label: { color: PURPLE, fontSize: 9, formatter: 'Mw=101000' } },
          ],
        },
      },
      {
        name: compare ? 'MALLS #1' : 'MALLS信号',
        type: 'line',
        yAxisIndex: 1,
        data: x.map((v, i) => [v, malls[i]]),
        lineStyle: { color: PURPLE, width: 1.5 },
        symbol: 'none',
      },
      ...(compare ? [
        {
          name: 'RI信号 #2',
          type: 'line' as const,
          yAxisIndex: 0,
          data: x.map((v, i) => [v, ri2[i] * 0.88]),
          lineStyle: { color: ORANGE, width: 1.5, type: 'dashed' as const },
          symbol: 'none',
        },
        {
          name: 'MALLS #2',
          type: 'line' as const,
          yAxisIndex: 1,
          data: x.map((v, i) => [v, malls2[i] * 0.85]),
          lineStyle: { color: WARN, width: 1.5, type: 'dashed' as const },
          symbol: 'none',
        },
      ] : []),
    ],
    tooltip: commonTooltip,
  }

  return <ReactECharts option={option} style={{ flex: 1, minHeight: 0 }} />
}

// ── DSC 图表 ──────────────────────────────────────────
function DSCChart() {
  const { x, y } = useMemo(makeDSCData, [])

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 48, left: 55, right: 20 },
    xAxis: {
      type: 'value' as const,
      name: '温度 (°C)',
      nameLocation: 'middle' as const,
      nameGap: 28,
      nameTextStyle: { color: MUTED, fontSize: 10 },
      min: 50, max: 180,
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}50` } },
    },
    yAxis: {
      type: 'value' as const,
      name: '热流 (mW/mg)',
      nameTextStyle: { color: MUTED, fontSize: 10 },
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}50` } },
    },
    series: [{
      type: 'line',
      data: x.map((v, i) => [v, y[i]]),
      lineStyle: { color: WARN, width: 2 },
      symbol: 'none',
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${WARN}20` }, { offset: 1, color: `${WARN}00` }] }
      },
      markPoint: {
        data: [
          {
            coord: [135.2, -0.85],
            name: 'Tm',
            symbol: 'pin',
            symbolSize: 30,
            itemStyle: { color: DANGER },
            label: { color: '#fff', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', formatter: 'Tm\n135.2°C' },
          },
          {
            coord: [108.4, 0.42],
            name: 'Tc',
            symbol: 'pin',
            symbolSize: 30,
            itemStyle: { color: GREEN },
            label: { color: '#000', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', formatter: 'Tc\n108.4°C' },
          },
        ],
      },
    }],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(8,12,24,0.96)',
      borderColor: BORDER,
      textStyle: { color: TEXT, fontSize: 11 },
      formatter: (p: any) => `${p[0].data[0].toFixed(1)}°C<br/>热流: ${p[0].data[1].toFixed(4)} mW/mg`,
    },
  }

  return <ReactECharts option={option} style={{ flex: 1, minHeight: 0 }} />
}

// ── NMR 图表 ──────────────────────────────────────────
function NMRChart() {
  const { x, y } = useMemo(makeNMRData, [])

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 48, left: 55, right: 20 },
    xAxis: {
      type: 'value' as const,
      name: 'δ (ppm)',
      nameLocation: 'middle' as const,
      nameGap: 28,
      nameTextStyle: { color: MUTED, fontSize: 10 },
      min: 0, max: 8,
      inverse: true,
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}50` } },
    },
    yAxis: {
      type: 'value' as const,
      name: '强度',
      nameTextStyle: { color: MUTED, fontSize: 10 },
      axisLabel: { show: false },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { show: false },
      min: 0,
    },
    series: [{
      type: 'line',
      data: x.map((v, i) => [v, y[i]]),
      lineStyle: { color: GREEN, width: 1.5 },
      symbol: 'none',
      markArea: {
        silent: true,
        itemStyle: { color: `${PURPLE}20`, borderColor: `${PURPLE}50`, borderWidth: 1 },
        data: [[
          { xAxis: 1.8, label: { position: 'insideTopRight', color: PURPLE, fontSize: 9 } },
          { xAxis: 2.2, label: { position: 'insideTopRight', color: PURPLE, fontSize: 9, formatter: '共单体插入率 8.2%' } },
        ]],
      },
      markLine: {
        silent: true,
        data: [
          { xAxis: 0.9, lineStyle: { color: `${CYAN}80`, type: 'dashed' }, label: { color: CYAN, fontSize: 9, formatter: 'δ=0.9\n-CH₃' } },
          { xAxis: 1.3, lineStyle: { color: `${WARN}80`, type: 'dashed' }, label: { color: WARN, fontSize: 9, formatter: 'δ=1.3\n-CH₂-' } },
        ],
      },
    }],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(8,12,24,0.96)',
      borderColor: BORDER,
      textStyle: { color: TEXT, fontSize: 11 },
      formatter: (p: any) => `δ ${p[0].data[0].toFixed(2)} ppm`,
    },
  }

  return <ReactECharts option={option} style={{ flex: 1, minHeight: 0 }} />
}

// ── FTIR 图表 ──────────────────────────────────────────
function FTIRChart() {
  const { x, y } = useMemo(makeFTIRData, [])

  const peakLines = [
    { wavenumber: 2920, label: '2920\nCH₂νₐₛ', color: CYAN },
    { wavenumber: 2850, label: '2850\nCH₂νₛ', color: CYAN },
    { wavenumber: 1460, label: '1460\nCH₂δ', color: WARN },
    { wavenumber: 1380, label: '1380\nCH₃δ', color: GREEN },
    { wavenumber: 720, label: '720\nCH₂ρ', color: PURPLE },
  ]

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 48, left: 55, right: 20 },
    xAxis: {
      type: 'value' as const,
      name: '波数 (cm⁻¹)',
      nameLocation: 'middle' as const,
      nameGap: 28,
      nameTextStyle: { color: MUTED, fontSize: 10 },
      min: 500, max: 4000,
      inverse: true,
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}50` } },
    },
    yAxis: {
      type: 'value' as const,
      name: '透射率 (%)',
      nameTextStyle: { color: MUTED, fontSize: 10 },
      min: 0, max: 100,
      axisLabel: { color: MUTED, fontSize: 10 },
      axisLine: { lineStyle: { color: BORDER } },
      splitLine: { lineStyle: { color: `${BORDER}30` } },
    },
    series: [{
      type: 'line',
      data: x.map((v, i) => [v, y[i]]),
      lineStyle: { color: ORANGE, width: 1.5 },
      symbol: 'none',
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${ORANGE}00` }, { offset: 1, color: `${ORANGE}15` }] }
      },
      markLine: {
        silent: true,
        data: peakLines.map(p => ({
          xAxis: p.wavenumber,
          lineStyle: { color: p.color + 'a0', type: 'dashed' },
          label: { color: p.color, fontSize: 8, fontFamily: 'JetBrains Mono, monospace', formatter: p.label, position: 'insideStartTop' },
        })),
      },
    }],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(8,12,24,0.96)',
      borderColor: BORDER,
      textStyle: { color: TEXT, fontSize: 11 },
      formatter: (p: any) => `${p[0].data[0]} cm⁻¹<br/>透射率: ${p[0].data[1].toFixed(1)}%`,
    },
  }

  return <ReactECharts option={option} style={{ flex: 1, minHeight: 0 }} />
}

// ── AI 解读侧边栏 ──────────────────────────────────────────
function AISidebar() {
  const tableData = [
    { key: 'mn', param: 'Mn', current: '4.82×10⁴', best: '5.12×10⁴' },
    { key: 'mw', param: 'Mw', current: '1.01×10⁵', best: '9.84×10⁴' },
    { key: 'pdi', param: 'PDI', current: '2.1', best: '1.92' },
    { key: 'tm', param: 'Tm (°C)', current: '135.2', best: '136.7' },
    { key: 'xc', param: '结晶度 (%)', current: '67', best: '71' },
    { key: 'ins', param: '插入率 (%)', current: '8.2', best: '7.8' },
    { key: 'act', param: '活性 (kg/mol·h)', current: '8,640', best: '10,120' },
  ]

  const columns = [
    { title: '指标', dataIndex: 'param', key: 'param', render: (v: string) => <span style={{ color: MUTED, fontSize: 11 }}>{v}</span> },
    { title: '本批次', dataIndex: 'current', key: 'current', render: (v: string) => <span style={{ color: CYAN, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600 }}>{v}</span> },
    { title: '历史最优', dataIndex: 'best', key: 'best', render: (v: string) => <span style={{ color: GREEN, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{v}</span> },
  ]

  return (
    <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
      {/* AI 解读气泡 */}
      <div style={{
        ...cardStyle,
        background: `linear-gradient(135deg, rgba(123,97,255,0.12), rgba(0,212,255,0.06))`,
        border: `1px solid ${PURPLE}40`,
        flex: 'none',
        height: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `${PURPLE}30`, border: `1px solid ${PURPLE}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RobotOutlined style={{ color: PURPLE, fontSize: 13 }} />
          </div>
          <div>
            <div style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>AI 自动解读</div>
            <div style={{ color: MUTED, fontSize: 10 }}>基于多模态谱图分析</div>
          </div>
        </div>

        <div style={{ width: '100%', height: 1, background: BORDER, marginBottom: 10 }} />

        {[
          { text: 'PDI = 2.1，处于优质区间 [1.8, 2.4]', color: GREEN, prefix: '✓' },
          { text: '催化活性 8,640 kg/mol·h，超历史均值 23%', color: CYAN, prefix: '↑' },
          { text: '共单体插入率 8.2%，符合 LLDPE 目标规格', color: GREEN, prefix: '✓' },
          { text: '熔点 Tm=135.2°C，结晶度 67%', color: WARN, prefix: '●' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7, alignItems: 'flex-start' }}>
            <span style={{ color: item.color, fontSize: 11, flexShrink: 0, fontWeight: 700, lineHeight: '16px' }}>{item.prefix}</span>
            <span style={{ color: TEXT, fontSize: 11, lineHeight: '16px' }}>{item.text}</span>
          </div>
        ))}

        <div style={{ width: '100%', height: 1, background: BORDER, margin: '10px 0' }} />

        {/* 综合评级 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: MUTED, fontSize: 10, marginBottom: 4 }}>综合评级</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4].map(i => (
              <StarFilled key={i} style={{ color: WARN, fontSize: 16 }} />
            ))}
            <StarOutlined style={{ color: MUTED, fontSize: 16 }} />
            <span style={{ color: WARN, fontSize: 12, fontWeight: 700, marginLeft: 6 }}>优秀</span>
          </div>
        </div>

        {/* 建议 */}
        <div style={{
          background: `${GREEN}10`, border: `1px solid ${GREEN}30`,
          borderRadius: 8, padding: '8px 10px',
        }}>
          <div style={{ color: GREEN, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>建议</div>
          <div style={{ color: TEXT, fontSize: 11, lineHeight: 1.5 }}>
            可进行批量放大实验验证，当前批次各项指标稳定。
          </div>
        </div>
      </div>

      {/* 对比表格 */}
      <div style={{ ...cardStyle, flex: 'none', height: 'auto' }}>
        <div style={{ color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>关键参数对比</div>
        <Table
          dataSource={tableData}
          columns={columns}
          size="small"
          pagination={false}
          style={{ color: TEXT }}
          rowClassName={(_, i) => i % 2 === 0 ? 'even-row' : ''}
        />
      </div>
    </div>
  )
}

// ── 象限标题 ──────────────────────────────────────────
function QuadrantTitle({ title, subtitle, color = CYAN }: { title: string; subtitle?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{title}</span>
      {subtitle && <span style={{ color: MUTED, fontSize: 10 }}>{subtitle}</span>}
    </div>
  )
}

// ── 主页面 ──────────────────────────────────────────
export default function SpectrumAnalysis() {
  const [batch, setBatch] = useState('WO-20240518-047')
  const [compare, setCompare] = useState(false)

  const batches = [
    { value: 'WO-20240518-047', label: 'WO-047 | CAT-2024-0045 | 2024-05-18' },
    { value: 'WO-20240517-038', label: 'WO-038 | CAT-2024-0041 | 2024-05-17' },
    { value: 'WO-20240516-030', label: 'WO-030 | CAT-2024-0040 | 2024-05-16' },
  ]

  return (
    <div style={{
      background: BG, height: '100%', display: 'flex', flexDirection: 'column',
      color: TEXT, fontFamily: 'system-ui, sans-serif', overflow: 'hidden',
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <span style={{ color: MUTED, fontSize: 12, flexShrink: 0 }}>批次选择</span>
        <Select
          value={batch}
          onChange={setBatch}
          options={batches}
          style={{ width: 320 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: MUTED, fontSize: 12 }}>多批次对比</span>
          <Switch checked={compare} onChange={setCompare} size="small" />
          {compare && (
            <Tag style={{ background: `${PURPLE}20`, border: `1px solid ${PURPLE}50`, color: PURPLE, fontSize: 10 }}>
              对比模式
            </Tag>
          )}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            icon={<DownloadOutlined />}
            style={{
              background: `${CYAN}15`, border: `1px solid ${CYAN}50`,
              color: CYAN, borderRadius: 8, fontSize: 12,
            }}
          >
            导出报告
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', minHeight: 0 }}>
        {/* 四象限 */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, padding: '12px 12px 12px 16px', minWidth: 0, overflow: 'hidden' }}>
          {/* 左上 GPC */}
          <div style={cardStyle}>
            <QuadrantTitle
              title="GPC 分子量分布"
              subtitle="双检测器 RI + MALLS"
              color={CYAN}
            />
            <GPCChart compare={compare} />
          </div>

          {/* 右上 DSC */}
          <div style={cardStyle}>
            <QuadrantTitle
              title="DSC 差示扫描量热"
              subtitle="熔融 & 结晶行为"
              color={WARN}
            />
            <DSCChart />
          </div>

          {/* 左下 NMR */}
          <div style={cardStyle}>
            <QuadrantTitle
              title="¹H NMR 谱"
              subtitle="结构表征 | 共单体插入率"
              color={GREEN}
            />
            <NMRChart />
          </div>

          {/* 右下 FTIR */}
          <div style={cardStyle}>
            <QuadrantTitle
              title="FTIR 红外谱"
              subtitle="官能团鉴定"
              color={ORANGE}
            />
            <FTIRChart />
          </div>
        </div>

        {/* 右侧 AI 侧边栏 */}
        <div style={{ padding: '12px 16px 12px 0', overflowY: 'auto', flexShrink: 0 }}>
          <AISidebar />
        </div>
      </div>
    </div>
  )
}
