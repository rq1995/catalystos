import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Select } from 'antd'
import { catalysts } from '../../mock/data'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

const metalColor: Record<string, string> = { Zr: '#00d4ff', Hf: '#7b61ff', Ti: '#ffb800' }

function makeScatter(xKey: keyof typeof catalysts[0], yKey: keyof typeof catalysts[0], xName: string, yName: string) {
  const grouped: Record<string, number[][]> = { Zr: [], Hf: [], Ti: [] }
  catalysts.forEach(c => {
    const x = c[xKey] as number
    const y = c[yKey] as number
    if (x != null && y != null) grouped[c.metal]?.push([x, y])
  })
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' },
      formatter: (p: any) => `${p.seriesName}<br/>${xName}: ${p.value[0]}<br/>${yName}: ${p.value[1]}` },
    grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
    legend: { data: ['Zr', 'Hf', 'Ti'], textStyle: { color: '#6b8aad', fontSize: 9 }, top: 2, itemWidth: 10, itemHeight: 6 },
    xAxis: {
      type: 'value', name: xName, nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      axisLabel: { color: '#6b8aad', fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value', name: yName, nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      axisLabel: { color: '#6b8aad', fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { show: false },
    },
    series: Object.entries(grouped).map(([metal, data]) => ({
      name: metal, type: 'scatter', data, symbolSize: 7,
      itemStyle: { color: metalColor[metal], opacity: 0.9 },
    })),
  }
}

function getHeatmapOption() {
  const labels = ['活性', 'PDI', 'Tm', 'Al-Zr', '温度']
  const raw = [
    [1.0, -0.62, 0.48, 0.71, 0.83],
    [-0.62, 1.0, -0.35, -0.51, -0.44],
    [0.48, -0.35, 1.0, 0.29, 0.55],
    [0.71, -0.51, 0.29, 1.0, 0.62],
    [0.83, -0.44, 0.55, 0.62, 1.0],
  ]
  const data: number[][] = []
  raw.forEach((row, i) => row.forEach((v, j) => data.push([j, i, v])))
  return {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (p: any) => `${labels[p.value[1]]} × ${labels[p.value[0]]}<br/>Pearson r = ${p.value[2].toFixed(2)}`,
      backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' },
    },
    grid: { left: 50, right: 20, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: labels, axisLabel: { color: '#6b8aad', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'category', data: labels, axisLabel: { color: '#6b8aad', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
    visualMap: {
      min: -1, max: 1, calculable: true, orient: 'horizontal', bottom: 0, left: 'center',
      textStyle: { color: '#6b8aad', fontSize: 9 },
      inRange: { color: ['#ff4757', '#2d3748', '#00d4ff'] },
    },
    series: [{
      type: 'heatmap', data,
      label: { show: true, formatter: (p: any) => p.value[2].toFixed(2), fontSize: 10, color: '#e8f4ff' },
    }],
  }
}

const paramInsights: Record<string, { data: number[][], xLabel: string, note: string }> = {
  'Al/Zr比': {
    xLabel: 'Al/Zr 比',
    data: [[400,4200],[500,5800],[600,7100],[700,8300],[800,8900],[900,9400],[1000,9600],[1100,9500],[1200,9200],[1300,8800]],
    note: 'Al/Zr比在600-900范围内对活性正向影响显著，超过1000后边际效应递减',
  },
  '温度': {
    xLabel: '温度 (°C)',
    data: [[40,3200],[50,5100],[55,6800],[60,8200],[65,9400],[70,9800],[75,9200],[80,8100],[90,6500]],
    note: '最优反应温度区间 65-70°C，过高导致催化剂失活',
  },
  '压力': {
    xLabel: '压力 (MPa)',
    data: [[0.3,5200],[0.4,6800],[0.5,8100],[0.6,9200],[0.7,9600],[0.8,9500],[0.9,9100],[1.0,8600]],
    note: '压力在0.6-0.7 MPa时活性最优，适度加压有利于单体溶解',
  },
}

function getSensitivityOption(param: string) {
  const cfg = paramInsights[param] ?? paramInsights['Al/Zr比']
  const xs = cfg.data.map(d => d[0])
  const ys = cfg.data.map(d => d[1])
  const upper = ys.map(y => y + 300 + Math.random() * 200)
  const lower = ys.map(y => y - 300 - Math.random() * 200)
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' } },
    grid: { left: 8, right: 8, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category', data: xs, name: cfg.xLabel, nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', name: '活性', nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '上界', type: 'line', data: upper, smooth: true,
        lineStyle: { opacity: 0 }, symbol: 'none',
        areaStyle: { color: 'rgba(107,138,173,0.15)', origin: 'auto' },
        stack: 'confidence',
      },
      {
        name: '下界', type: 'line', data: lower, smooth: true,
        lineStyle: { opacity: 0 }, symbol: 'none',
        areaStyle: { color: 'rgba(8,12,24,0)', origin: 'auto' },
        stack: 'confidence',
      },
      {
        name: '活性', type: 'line', data: ys, smooth: true,
        lineStyle: { color: '#00d4ff', width: 2 },
        itemStyle: { color: '#00d4ff' }, symbol: 'circle', symbolSize: 5,
      },
    ],
  }
}

export default function StructurePerf() {
  const [param, setParam] = useState('Al/Zr比')

  const scatterPairs: Array<[keyof typeof catalysts[0], keyof typeof catalysts[0], string, string]> = [
    ['pdi', 'activity', 'PDI', '活性'],
    ['tm', 'activity', 'Tm (°C)', '活性'],
    ['insertion', 'pdi', '插入率 (%)', 'PDI'],
    ['activity', 'tm', '活性', 'Tm (°C)'],
  ]

  const insight = paramInsights[param] ?? paramInsights['Al/Zr比']

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 说明 */}
      <div style={{ color: '#6b8aad', fontSize: 12, padding: '8px 12px', background: 'rgba(0,212,255,0.04)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.1)', flexShrink: 0 }}>
        分析 <span style={{ color: '#00d4ff', fontWeight: 600 }}>156</span> 个实验样本的结构-性能关联规律，颜色代表金属中心（
        <span style={{ color: '#00d4ff' }}>● Zr</span>　<span style={{ color: '#7b61ff' }}>● Hf</span>　<span style={{ color: '#ffb800' }}>● Ti</span>）
      </div>

      {/* 主区域 */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* 左侧 65% */}
        <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {/* 散点矩阵 */}
          <div style={{ ...glass, padding: '14px 16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>散点矩阵（结构-性能关联）</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
              {scatterPairs.map(([xKey, yKey, xName, yName]) => (
                <div key={`${xKey}-${yKey}`} style={{ minHeight: 0 }}>
                  <ReactECharts option={makeScatter(xKey, yKey, xName, yName)} style={{ height: '100%' }} />
                </div>
              ))}
            </div>
          </div>

          {/* 相关系数热力图 */}
          <div style={{ ...glass, padding: '14px 16px', height: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Pearson 相关系数热力图</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ReactECharts option={getHeatmapOption()} style={{ height: '100%' }} />
            </div>
          </div>
        </div>

        {/* 右侧 35% */}
        <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <div style={{ ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 300 }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>参数敏感性分析</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#6b8aad', fontSize: 11 }}>分析参数：</span>
              <Select
                value={param}
                onChange={setParam}
                size="small"
                style={{ flex: 1 }}
                options={[
                  { value: 'Al/Zr比', label: 'Al/Zr 比' },
                  { value: '温度', label: '温度' },
                  { value: '压力', label: '压力' },
                ]}
              />
            </div>
            <div style={{ flex: 1, minHeight: 180 }}>
              <ReactECharts option={getSensitivityOption(param)} style={{ height: '100%' }} />
            </div>
            <div style={{
              marginTop: 12, padding: '10px 12px',
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: 8, color: '#6b8aad', fontSize: 11, lineHeight: 1.6,
            }}>
              <span style={{ color: '#00d4ff', fontWeight: 600 }}>分析结论：</span>
              <br />
              {insight.note}
            </div>
          </div>

          {/* 额外统计卡 */}
          <div style={{ ...glass, padding: '14px 16px' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>相关性排名</div>
            {[
              { pair: '温度 → 活性', r: 0.83, color: '#00d4ff' },
              { pair: 'Al/Zr → 活性', r: 0.71, color: '#00ff88' },
              { pair: 'PDI → 活性', r: -0.62, color: '#ff4757' },
              { pair: 'Tm → 活性', r: 0.48, color: '#ffb800' },
              { pair: '插入率 → PDI', r: 0.39, color: '#7b61ff' },
            ].map(item => (
              <div key={item.pair} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: '#6b8aad', fontSize: 11 }}>{item.pair}</span>
                  <span style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600 }}>r = {item.r}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', width: `${Math.abs(item.r) * 100}%`, background: item.color, borderRadius: 2, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
