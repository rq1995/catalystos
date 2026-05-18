import React, { useState, useEffect } from 'react'
import { Button, Timeline, Progress } from 'antd'
import ReactECharts from 'echarts-for-react'

const theme = {
  bg: '#080c18',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  radius: 12,
  primary: '#00d4ff',
  success: '#00ff88',
  warning: '#ffb800',
  danger: '#ff4757',
  purple: '#7b61ff',
  text: '#e8f4ff',
  sub: '#6b8aad',
}

const cardStyle: React.CSSProperties = {
  background: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: theme.radius,
  padding: '16px 20px',
}

const convergenceOption = {
  backgroundColor: 'transparent',
  legend: {
    top: 8,
    right: 12,
    textStyle: { color: theme.sub, fontSize: 11 },
    itemWidth: 16,
    itemHeight: 3,
  },
  grid: { top: 52, bottom: 40, left: 64, right: 24 },
  xAxis: {
    type: 'category',
    data: ['第1轮', '第2轮', '第3轮', '第4轮(预测)'],
    axisLine: { lineStyle: { color: theme.border } },
    axisLabel: { color: theme.sub, fontSize: 12 },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    name: '催化活性 (kg/mol·h)',
    nameTextStyle: { color: theme.sub, fontSize: 11, padding: [0, 0, 0, 50] },
    min: 0,
    max: 12000,
    axisLine: { lineStyle: { color: theme.border } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: theme.sub, fontSize: 11 },
  },
  series: [
    {
      name: '历史最优活性',
      type: 'line',
      data: [3200, 5840, 7120, null],
      smooth: true,
      lineStyle: { color: theme.primary, width: 2.5 },
      itemStyle: { color: theme.primary },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${theme.primary}33` }, { offset: 1, color: `${theme.primary}04` }] } },
      connectNulls: false,
    },
    {
      name: '平均活性',
      type: 'line',
      data: [2800, 4200, 5900, null],
      smooth: true,
      lineStyle: { color: theme.purple, width: 2 },
      itemStyle: { color: theme.purple },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${theme.purple}28` }, { offset: 1, color: `${theme.purple}04` }] } },
      connectNulls: false,
    },
    {
      name: '预测最优',
      type: 'line',
      data: [null, null, 7120, 9800],
      smooth: true,
      lineStyle: { color: `${theme.primary}99`, width: 2, type: 'dashed' },
      itemStyle: { color: `${theme.primary}99` },
      symbol: 'circle',
      symbolSize: 6,
      connectNulls: true,
    },
    {
      name: '预测平均',
      type: 'line',
      data: [null, null, 5900, 7500],
      smooth: true,
      lineStyle: { color: `${theme.purple}88`, width: 2, type: 'dashed' },
      itemStyle: { color: `${theme.purple}88` },
      symbol: 'circle',
      symbolSize: 6,
      connectNulls: true,
    },
  ],
  markArea: {
    silent: true,
    data: [
      [
        {
          name: '探索阶段',
          xAxis: '第1轮',
          itemStyle: { color: 'rgba(255,255,255,0.03)' },
          label: { color: theme.sub, fontSize: 11, position: 'insideTopLeft', offset: [4, 4] },
        },
        { xAxis: '第1轮' },
      ],
      [
        {
          name: 'AI引导收敛',
          xAxis: '第2轮',
          itemStyle: { color: 'rgba(0,212,255,0.05)' },
          label: { color: `${theme.primary}bb`, fontSize: 11, position: 'insideTopLeft', offset: [4, 4] },
        },
        { xAxis: '第3轮' },
      ],
    ],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(8,12,24,0.92)',
    borderColor: theme.border,
    textStyle: { color: theme.text, fontSize: 12 },
  },
}

// Inject markArea into the chart (ECharts doesn't support top-level markArea, put in first series)
const chartOption = {
  ...convergenceOption,
  series: convergenceOption.series.map((s, i) =>
    i === 0 ? { ...s, markArea: { silent: true, data: convergenceOption.markArea.data } } : s
  ),
}

const timelineItems = [
  {
    color: theme.sub,
    children: (
      <div>
        <div style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>
          第1轮
          <span style={{ color: theme.sub, fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
            2024-05-01
          </span>
        </div>
        <div style={{ color: theme.sub, fontSize: 12, marginTop: 2 }}>
          随机探索 · 12次实验
        </div>
        <div style={{ color: theme.sub, fontSize: 12 }}>
          基线活性{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: theme.text }}>
            3,200
          </span>
        </div>
      </div>
    ),
  },
  {
    color: theme.success,
    children: (
      <div>
        <div style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>
          第2轮
          <span style={{ color: theme.sub, fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
            2024-05-08
          </span>
        </div>
        <div style={{ color: theme.sub, fontSize: 12, marginTop: 2 }}>
          GPR引导 · 8次实验
        </div>
        <div style={{ fontSize: 12 }}>
          最优{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: theme.text }}>
            5,840
          </span>{' '}
          <span style={{ color: theme.success }}>↑82%</span>
        </div>
      </div>
    ),
  },
  {
    color: theme.primary,
    children: (
      <div>
        <div style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>
          第3轮
          <span style={{ color: theme.sub, fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
            2024-05-15
          </span>
        </div>
        <div style={{ color: theme.sub, fontSize: 12, marginTop: 2 }}>
          GPR引导（进行中）· 6次实验
        </div>
        <div style={{ fontSize: 12 }}>
          最优{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: theme.text }}>
            7,120
          </span>{' '}
          <span style={{ color: theme.primary }}>↑22%</span>
        </div>
      </div>
    ),
  },
  {
    color: theme.purple,
    children: (
      <div>
        <div style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>
          第4轮
          <span style={{ color: theme.sub, fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
            2024-05-22
          </span>
        </div>
        <div style={{ color: theme.sub, fontSize: 12, marginTop: 2 }}>
          AI推荐待执行 · 预计~5次
        </div>
        <div style={{ fontSize: 12 }}>
          预测{' '}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: theme.purple,
              fontStyle: 'italic',
            }}
          >
            9,800
          </span>
        </div>
      </div>
    ),
  },
]

const statsData = [
  { label: '已节省实验次数', value: 47, unit: '次', color: theme.primary },
  { label: '等效传统方法效率', value: 3.8, unit: 'x', color: theme.success, isDecimal: true },
  { label: '模型迭代轮次', value: 3, unit: '次', color: theme.purple },
  { label: '预计下轮推荐点', value: 1, unit: '个', color: theme.warning },
]

export default function ActiveLearning() {
  const [counts, setCounts] = useState(statsData.map(() => 0))

  useEffect(() => {
    const targets = statsData.map((s) => s.value)
    const duration = 1400
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounts(targets.map((t) => (typeof t === 'number' ? parseFloat((t * eased).toFixed(1)) : 0)))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [])

  const handleRecommend = () => {
    window.location.hash = '/ai/recommend'
  }

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: theme.bg,
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        color: theme.text,
        boxSizing: 'border-box',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>
            当前项目：茂金属催化剂高通量筛选
          </span>
          <span
            style={{
              background: `${theme.primary}18`,
              color: theme.primary,
              border: `1px solid ${theme.primary}44`,
              borderRadius: 6,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 600,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            ● 第3轮迭代进行中
          </span>
        </div>
        <Button
          type="primary"
          style={{
            background: theme.primary,
            borderColor: theme.primary,
            color: '#000',
            fontWeight: 600,
            borderRadius: 8,
          }}
          onClick={handleRecommend}
        >
          查看AI推荐
        </Button>
      </div>

      {/* Convergence chart */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{ fontSize: 13, fontWeight: 600, color: theme.sub, marginBottom: 4 }}
        >
          迭代收敛趋势
        </div>
        <ReactECharts option={chartOption} style={{ height: 260 }} />
      </div>

      {/* Bottom 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '35% 30% 35%', gap: 16 }}>
        {/* Left: Timeline */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.sub,
              marginBottom: 16,
            }}
          >
            迭代时间线
          </div>
          <Timeline items={timelineItems} style={{ paddingLeft: 4 }} />
        </div>

        {/* Center: Efficiency stats */}
        <div style={cardStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.sub,
              marginBottom: 16,
            }}
          >
            效率对比
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {statsData.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: `${stat.color}0d`,
                  border: `1px solid ${stat.color}28`,
                  borderRadius: 10,
                  padding: '14px 12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 28,
                    fontWeight: 700,
                    color: stat.color,
                    lineHeight: 1.1,
                  }}
                >
                  {stat.isDecimal
                    ? counts[i].toFixed(1)
                    : Math.round(counts[i])}
                  <span style={{ fontSize: 14, marginLeft: 2 }}>{stat.unit}</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.sub,
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI recommendation preview */}
        <div
          style={{
            ...cardStyle,
            background: `linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(123,97,255,0.06) 100%)`,
            border: `1px solid ${theme.primary}33`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: theme.primary,
              marginBottom: 14,
            }}
          >
            第4轮推荐方案（AI预测）
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.sub, marginBottom: 3 }}>
              推荐催化剂
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 15,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              CAT-2024-0046
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.sub, marginBottom: 6 }}>
              关键参数
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {['温度 68°C', 'Al/Zr=920', '压力 0.65 MPa'].map((p) => (
                <span
                  key={p}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 5,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: theme.text,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: theme.sub, marginBottom: 4 }}>
              预测活性区间
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 20,
                fontWeight: 700,
                color: theme.primary,
              }}
            >
              8,800 ~ 10,800
              <span style={{ fontSize: 12, color: theme.sub, marginLeft: 4 }}>
                kg/mol·h
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: theme.sub,
                marginBottom: 6,
              }}
            >
              <span>推荐信心</span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: theme.primary,
                }}
              >
                78%
              </span>
            </div>
            <Progress
              percent={78}
              showInfo={false}
              strokeColor={theme.primary}
              trailColor="rgba(255,255,255,0.08)"
              strokeWidth={8}
            />
          </div>

          <Button
            block
            style={{
              background: `${theme.primary}1a`,
              borderColor: theme.primary,
              color: theme.primary,
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={handleRecommend}
          >
            查看完整推荐
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </div>
  )
}
