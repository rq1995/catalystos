import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { DatePicker, Select, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

// 过去30天每日最大活性
function getActivityTrendOption() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2024, 4, i + 1)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const data = [7200,7350,7820,8100,7950,8240,8560,8320,8710,8940,8200,8650,9100,8880,9240,8760,9380,9120,9540,9200,9680,9420,9800,9560,9720,9880,10100,9940,10120,10240]
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#e8f4ff' } },
    grid: { left: 8, right: 8, top: 16, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: days.filter((_, i) => i % 5 === 0 || i === 29),
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [{
      type: 'line',
      data: data.filter((_, i) => i % 5 === 0 || i === 29),
      smooth: true,
      symbol: 'circle', symbolSize: 4,
      lineStyle: { color: '#00d4ff', width: 2 },
      itemStyle: { color: '#00d4ff' },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.35)' }, { offset: 1, color: 'rgba(0,212,255,0.01)' }] },
      },
    }],
  }
}

function getMonthlyBatchOption() {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#e8f4ff' } },
    legend: { data: ['本月', '上月'], textStyle: { color: '#6b8aad', fontSize: 10 }, top: 0 },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: ['Zr', 'Hf', 'Ti'],
      axisLabel: { color: '#6b8aad', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [
      { name: '本月', type: 'bar', data: [28, 16, 8], barMaxWidth: 20, itemStyle: { color: '#00d4ff', borderRadius: [4, 4, 0, 0] } },
      { name: '上月', type: 'bar', data: [21, 13, 11], barMaxWidth: 20, itemStyle: { color: 'rgba(0,212,255,0.3)', borderRadius: [4, 4, 0, 0] } },
    ],
  }
}

function getPDIBoxOption() {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#e8f4ff' } },
    grid: { left: 8, right: 8, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: ['Zr基', 'Hf基', 'Ti基'],
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', name: 'PDI',
      nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [{
      type: 'boxplot',
      data: [
        [1.7, 1.9, 2.1, 2.3, 2.6],
        [1.5, 1.7, 1.9, 2.1, 2.4],
        [2.4, 2.8, 3.1, 3.5, 4.2],
      ],
      itemStyle: { color: 'rgba(0,212,255,0.1)', borderColor: '#00d4ff', borderWidth: 1.5 },
    }],
  }
}

function getScatterOption() {
  const zrData = Array.from({ length: 30 }, () => [1.6 + Math.random() * 0.8, 7000 + Math.random() * 3500])
  const hfData = Array.from({ length: 20 }, () => [1.4 + Math.random() * 0.7, 5500 + Math.random() * 3000])
  const tiData = Array.from({ length: 15 }, () => [2.4 + Math.random() * 1.5, 3000 + Math.random() * 2500])
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#e8f4ff' },
      formatter: (p: any) => `${p.seriesName}<br/>PDI: ${p.value[0].toFixed(2)}<br/>活性: ${Math.round(p.value[1])} kg/mol·h` },
    legend: { data: ['Zr', 'Hf', 'Ti'], textStyle: { color: '#6b8aad', fontSize: 11 }, top: 8, right: 8 },
    grid: { left: 10, right: 10, top: 40, bottom: 10, containLabel: true },
    xAxis: {
      type: 'value', name: 'PDI', nameTextStyle: { color: '#6b8aad' },
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value', name: '活性 (kg/mol·h)', nameTextStyle: { color: '#6b8aad', fontSize: 10 },
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [
      { name: 'Zr', type: 'scatter', data: zrData, symbolSize: 9, itemStyle: { color: '#00d4ff', opacity: 0.85 } },
      { name: 'Hf', type: 'scatter', data: hfData, symbolSize: 9, itemStyle: { color: '#7b61ff', opacity: 0.85 } },
      { name: 'Ti', type: 'scatter', data: tiData, symbolSize: 9, itemStyle: { color: '#ffb800', opacity: 0.85 } },
    ],
  }
}

function getRadarOption() {
  return {
    backgroundColor: 'transparent',
    legend: { data: ['本月', '上月'], textStyle: { color: '#6b8aad', fontSize: 10 }, bottom: 0 },
    radar: {
      indicator: [
        { name: '活性', max: 100 },
        { name: 'PDI优化', max: 100 },
        { name: '稳定性', max: 100 },
        { name: '效率', max: 100 },
        { name: '成本控制', max: 100 },
      ],
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      name: { textStyle: { color: '#6b8aad', fontSize: 10 } },
    },
    series: [{
      type: 'radar',
      data: [
        { name: '本月', value: [88, 75, 82, 91, 70], lineStyle: { color: '#00d4ff' }, areaStyle: { color: 'rgba(0,212,255,0.15)' }, itemStyle: { color: '#00d4ff' } },
        { name: '上月', value: [72, 68, 76, 80, 78], lineStyle: { color: '#7b61ff' }, areaStyle: { color: 'rgba(123,97,255,0.1)' }, itemStyle: { color: '#7b61ff' } },
      ],
    }],
  }
}

export default function DataScreen() {
  const [metal, setMetal] = useState('all')

  const kpiCards = [
    { label: '总样本量', value: '156', color: '#00d4ff', sub: '实验数据点' },
    { label: '平均活性', value: '7,842', color: '#00ff88', sub: 'kg/mol·h' },
    { label: '最优批次活性', value: '10,240', color: '#ffb800', sub: 'CAT-2024-0041' },
    { label: 'AI预测准确率', value: '87.3%', color: '#7b61ff', sub: '本月 +2.1%' },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: '#040810',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 顶部筛选栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        <span style={{ color: '#00d4ff', fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>数据大屏 BI</span>
        <div style={{ flex: 1 }} />
        <RangePicker
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
          size="small"
        />
        <Select
          value={metal}
          onChange={setMetal}
          size="small"
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部金属中心' },
            { value: 'Zr', label: 'Zr 锆' },
            { value: 'Hf', label: 'Hf 铪' },
            { value: 'Ti', label: 'Ti 钛' },
          ]}
        />
        <Button size="small" icon={<DownloadOutlined />} type="primary" ghost>导出</Button>
      </div>

      {/* 主网格 */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, padding: 16, minHeight: 0 }}>

        {/* 左上：活性分布趋势 */}
        <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>活性分布趋势（过去30天）</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={getActivityTrendOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 中：散点图（跨两行） */}
        <div style={{ ...glass, padding: '14px 16px', gridRow: '1 / 3', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>活性 vs 金属中心散点图</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={getScatterOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 右上：雷达图 */}
        <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>月度综合指标雷达</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={getRadarOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 左中：月度批次对比 */}
        <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>月度批次对比（Zr/Hf/Ti）</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={getMonthlyBatchOption()} style={{ height: '100%' }} />
          </div>
        </div>

        {/* 右下：关键数字卡片组 */}
        <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>关键指标</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
            {kpiCards.map(k => (
              <div key={k.label} style={{
                background: `${k.color}10`,
                border: `1px solid ${k.color}30`,
                borderRadius: 10,
                padding: '14px 12px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 6 }}>{k.label}</div>
                <div style={{ color: k.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.value}</div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部：PDI箱线图 */}
      <div style={{ height: 160, flexShrink: 0, margin: '0 16px 16px', ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>PDI分布箱线图（三类催化剂）</div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReactECharts option={getPDIBoxOption()} style={{ height: '100%' }} />
        </div>
      </div>
    </div>
  )
}
