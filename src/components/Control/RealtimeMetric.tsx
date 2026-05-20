import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'

interface Props {
  label: string
  unit: string
  setpoint: number
  actual: number
  min?: number
  max?: number
  color?: string
  history?: number[]
}

export default function RealtimeMetric({
  label, unit, setpoint, actual, min, max, color = '#00d4ff', history
}: Props) {
  const [data, setData] = useState<number[]>(() => history ?? Array.from({ length: 30 }, () => actual))

  useEffect(() => {
    if (history) {
      setData(history)
      return
    }
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1] ?? actual
        const next = last + (actual - last) * 0.25 + (Math.random() - 0.5) * (Math.abs(actual) * 0.01 + 0.05)
        const arr = [...prev.slice(1), next]
        return arr
      })
    }, 1000)
    return () => clearInterval(id)
  }, [actual, history])

  const dev = setpoint === 0 ? 0 : Math.abs(actual - setpoint) / Math.max(Math.abs(setpoint), 0.001)
  const devColor = dev < 0.02 ? '#00ff88' : dev < 0.08 ? '#ffb800' : '#ff4757'

  const option = {
    animation: false,
    grid: { top: 4, bottom: 4, left: 4, right: 4 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: {
      type: 'value', show: false,
      min: min, max: max,
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color, width: 2 },
        areaStyle: { color: `${color}22` },
        markLine: setpoint != null ? {
          symbol: 'none',
          silent: true,
          lineStyle: { color: '#ffffff44', type: 'dashed', width: 1 },
          data: [{ yAxis: setpoint }],
        } : undefined,
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (p: { value: number }[]) => `${p[0].value.toFixed(3)} ${unit}`,
      backgroundColor: '#0d1525',
      borderColor: 'rgba(255,255,255,0.08)',
      textStyle: { color: '#e8f4ff', fontSize: 11 },
    },
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#6b8aad', fontSize: 11 }}>{label}</span>
        <span style={{ color: devColor, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
          Δ {((actual - setpoint)).toFixed(2)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ color, fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
          {actual.toFixed(2)}
        </span>
        <span style={{ color: '#6b8aad', fontSize: 10 }}>{unit}</span>
        <span style={{ marginLeft: 'auto', color: '#3d5168', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
          SP {setpoint.toFixed(2)}
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 48 }} opts={{ renderer: 'canvas' }} />
    </div>
  )
}
