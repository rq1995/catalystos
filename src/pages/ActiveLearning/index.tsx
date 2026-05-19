import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Select, Button, Progress } from 'antd'
import { ArrowUpOutlined, RocketOutlined } from '@ant-design/icons'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function getMainChartOption() {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' } },
    legend: {
      data: ['历史最优活性', '平均活性'],
      textStyle: { color: '#6b8aad', fontSize: 11 },
      right: 10, top: 10,
    },
    grid: { left: 10, right: 10, top: 50, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['第1轮', '第2轮', '第3轮', '第4轮(预测)'],
      axisLabel: { color: '#6b8aad', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '催化活性 (kg/mol·h)',
      nameTextStyle: { color: '#6b8aad', fontSize: 10 },
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: '历史最优活性',
        type: 'line',
        data: [3200, 5840, 7120, 9800],
        smooth: true,
        symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#00d4ff', width: 2.5 },
        itemStyle: { color: '#00d4ff' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.2)' }, { offset: 1, color: 'rgba(0,212,255,0.01)' }] },
        },
        markArea: {
          silent: true,
          data: [
            [
              { name: '探索阶段', xAxis: '第1轮', itemStyle: { color: 'rgba(107,138,173,0.06)' }, label: { color: '#6b8aad', position: 'insideTop', fontSize: 10 } },
              { xAxis: '第1轮' },
            ],
            [
              { name: '收敛阶段', xAxis: '第2轮', itemStyle: { color: 'rgba(0,212,255,0.04)' }, label: { color: '#00d4ff', position: 'insideTop', fontSize: 10 } },
              { xAxis: '第3轮' },
            ],
          ],
        },
      },
      {
        name: '平均活性',
        type: 'line',
        data: [2800, 4200, 5900, 7500],
        smooth: true,
        symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#7b61ff', width: 2 },
        itemStyle: { color: '#7b61ff' },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(123,97,255,0.15)' }, { offset: 1, color: 'rgba(123,97,255,0.01)' }] },
        },
      },
    ],
  }
}

export default function ActiveLearning() {
  const savedExp = useCountUp(47)

  const iterHistory = [
    { round: 1, date: '2024-05-01', method: '随机探索', expCount: 12, best: 3200, growth: null, status: 'done' },
    { round: 2, date: '2024-05-08', method: 'GPR引导', expCount: 8, best: 5840, growth: 82, status: 'done' },
    { round: 3, date: '2024-05-15', method: 'GPR引导', expCount: 6, best: 7120, growth: 22, status: 'active' },
    { round: 4, date: '2024-05-22', method: 'AI推荐', expCount: null, best: 9800, growth: null, status: 'pending' },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Select
          defaultValue="proj-001"
          size="small"
          style={{ width: 200 }}
          options={[{ value: 'proj-001', label: '茂金属催化剂高通量筛选' }]}
        />
        <span style={{ color: '#6b8aad', fontSize: 12 }}>当前项目：<span style={{ color: '#00d4ff', fontWeight: 600 }}>茂金属催化剂高通量筛选</span></span>
        <div style={{ padding: '3px 12px', borderRadius: 20, background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.35)', color: '#ffb800', fontSize: 11, fontWeight: 600 }}>
          第3轮迭代进行中
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* 上半区：主折线图 */}
      <div style={{ flex: '0 0 55%', ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
        <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>主动学习迭代进度</div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReactECharts option={getMainChartOption()} style={{ height: '100%' }} />
        </div>
      </div>

      {/* 下半区三列 */}
      <div style={{ flex: '0 0 42%', display: 'flex', gap: 12, minHeight: 0 }}>

        {/* 左列：迭代历史 */}
        <div style={{ flex: 1, ...glass, padding: '14px 16px', overflow: 'auto' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>迭代历史</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {iterHistory.map((it, idx) => (
              <div key={it.round} style={{ display: 'flex', gap: 12, paddingBottom: idx < iterHistory.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: it.status === 'active' ? '#ffb800' : it.status === 'done' ? '#00ff88' : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${it.status === 'active' ? '#ffb800' : it.status === 'done' ? '#00ff88' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: it.status === 'pending' ? '#6b8aad' : '#080c18',
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700,
                  }}>
                    {it.round}
                  </div>
                  {idx < iterHistory.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.08)', minHeight: 16, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ color: '#6b8aad', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{it.date}</span>
                    <span style={{ color: '#e8f4ff', fontSize: 11, fontWeight: 600 }}>{it.method}</span>
                    {it.status === 'active' && <span style={{ color: '#ffb800', fontSize: 10 }}>进行中</span>}
                    {it.status === 'pending' && <span style={{ color: '#6b8aad', fontSize: 10 }}>待执行</span>}
                  </div>
                  <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 2 }}>
                    实验次数: <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace" }}>{it.expCount ?? '~5'}次</span>
                  </div>
                  <div style={{ color: '#6b8aad', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    最优活性: <span style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace" }}>{it.best.toLocaleString()}</span>
                    {it.growth && (
                      <span style={{ color: '#00ff88', fontSize: 10 }}>
                        <ArrowUpOutlined /> {it.growth}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中列：效率对比 */}
        <div style={{ flex: 1, ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>效率对比</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '已节省实验次数', value: savedExp, suffix: '次', color: '#00ff88' },
              { label: '等效传统方法', value: '3.8', suffix: 'x', color: '#00d4ff' },
              { label: '模型迭代次数', value: '3', suffix: '次', color: '#7b61ff' },
              { label: '下次推荐实验点', value: '1', suffix: '个', color: '#ffb800' },
            ].map(card => (
              <div key={card.label} style={{
                padding: '12px',
                background: `${card.color}08`,
                border: `1px solid ${card.color}25`,
                borderRadius: 10,
                textAlign: 'center',
              }}>
                <div style={{ color: card.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                  {card.value}{card.suffix}
                </div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 6, lineHeight: 1.4 }}>{card.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.04)', borderRadius: 8, border: '1px solid rgba(0,255,136,0.15)', marginTop: 'auto' }}>
            <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 4 }}>累计实验效率提升</div>
            <div style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 800 }}>3.8x</div>
            <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>相比传统方法</div>
          </div>
        </div>

        {/* 右列：AI推荐 */}
        <div style={{ flex: 1, ...glass, padding: '14px 16px', borderColor: 'rgba(123,97,255,0.3)', background: 'rgba(123,97,255,0.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RocketOutlined style={{ color: '#7b61ff', fontSize: 14 }} />
            <span style={{ color: '#7b61ff', fontSize: 12, fontWeight: 600 }}>下一轮推荐（来自AI）</span>
          </div>

          <div style={{ padding: '10px 12px', background: 'rgba(123,97,255,0.08)', borderRadius: 8, border: '1px solid rgba(123,97,255,0.2)' }}>
            <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 4 }}>推荐催化剂</div>
            <div style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700 }}>CAT-2024-0046</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { k: '反应温度', v: '68°C', color: '#ffb800' },
              { k: 'Al/Zr 比', v: '920', color: '#00d4ff' },
            ].map(p => (
              <div key={p.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <span style={{ color: '#6b8aad', fontSize: 11 }}>{p.k}</span>
                <span style={{ color: p.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{p.v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.04)', borderRadius: 8, border: '1px solid rgba(0,255,136,0.15)' }}>
            <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 4 }}>预测活性区间</div>
            <div style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700 }}>
              [8,800 ~ 10,800]
            </div>
            <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>kg/mol·h</div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#6b8aad', fontSize: 11 }}>推荐信心</span>
              <span style={{ color: '#7b61ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>78%</span>
            </div>
            <Progress
              percent={78}
              strokeColor="#7b61ff"
              trailColor="rgba(255,255,255,0.08)"
              showInfo={false}
              size="small"
            />
          </div>

          <Button type="primary" ghost size="small" block style={{ borderColor: '#7b61ff', color: '#7b61ff', marginTop: 'auto' }}>
            查看完整推荐
          </Button>
        </div>
      </div>
    </div>
  )
}
