import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { Button, Tag } from 'antd'
import { PauseCircleOutlined, CloseCircleOutlined, SendOutlined } from '@ant-design/icons'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

// 预设路径点
const paths = [
  [ // AGV-001
    { x: 130, y: 120 }, { x: 200, y: 120 }, { x: 280, y: 150 }, { x: 350, y: 200 }, { x: 400, y: 300 }, { x: 350, y: 350 }, { x: 280, y: 320 }, { x: 200, y: 280 }, { x: 130, y: 120 },
  ],
  [ // AGV-002
    { x: 550, y: 100 }, { x: 500, y: 130 }, { x: 420, y: 120 }, { x: 350, y: 100 }, { x: 350, y: 100 },
  ],
  [ // AGV-003
    { x: 100, y: 380 }, { x: 150, y: 340 }, { x: 220, y: 300 }, { x: 300, y: 280 }, { x: 380, y: 290 }, { x: 420, y: 350 }, { x: 480, y: 400 }, { x: 100, y: 380 },
  ],
]

interface AgvPos { x: number; y: number; angle: number; t: number }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function getHeatmapOption() {
  const cols = 20, rows = 15
  const data: number[][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hot1 = Math.exp(-((c - 6) ** 2 + (r - 5) ** 2) / 8) * 9
      const hot2 = Math.exp(-((c - 14) ** 2 + (r - 4) ** 2) / 10) * 7
      const hot3 = Math.exp(-((c - 4) ** 2 + (r - 10) ** 2) / 12) * 8
      data.push([c, r, Math.round(Math.min(10, hot1 + hot2 + hot3 + Math.random() * 1.5))])
    }
  }
  return {
    backgroundColor: 'transparent',
    tooltip: { formatter: (p: any) => `活动密度: ${p.value[2]}`, backgroundColor: 'rgba(8,12,24,0.9)', textStyle: { color: '#e8f4ff' } },
    grid: { left: 4, right: 4, top: 4, bottom: 4 },
    xAxis: { type: 'category', data: Array.from({ length: cols }, (_, i) => i), axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'category', data: Array.from({ length: rows }, (_, i) => i), axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    visualMap: { min: 0, max: 10, show: false, inRange: { color: ['rgba(0,0,0,0)', 'rgba(0,212,255,0.3)', 'rgba(0,212,255,0.8)', '#00ff88'] } },
    series: [{ type: 'heatmap', data, label: { show: false } }],
  }
}

export default function AGVControl() {
  const [agvPos, setAgvPos] = useState<AgvPos[]>([
    { x: 130, y: 120, angle: 0, t: 0 },
    { x: 550, y: 100, angle: 180, t: 0 },
    { x: 100, y: 380, angle: 45, t: 0 },
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setAgvPos(prev => prev.map((agv, idx) => {
        const path = paths[idx]
        const newT = agv.t + 0.012
        const totalSegments = path.length - 1
        const progress = newT % 1
        const seg = Math.floor((newT % 1 === 0 ? 0 : progress) * totalSegments)
        const segProgress = (progress * totalSegments) - seg
        const from = path[Math.min(seg, path.length - 1)]
        const to = path[Math.min(seg + 1, path.length - 1)]
        const x = lerp(from.x, to.x, segProgress)
        const y = lerp(from.y, to.y, segProgress)
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI
        return { x, y, angle, t: newT > 10 ? 0 : newT }
      }))
    }, 500)
    return () => clearInterval(timer)
  }, [])

  const agvConfigs = [
    { id: 'AGV-001', status: '执行中', task: '取样 R-15 → GPC-01', eta: '2min', color: '#00d4ff', hasActions: true },
    { id: 'AGV-002', status: '待命中', task: '—', eta: '—', color: '#6b8aad', hasActions: false },
    { id: 'AGV-003', status: '执行中', task: '物料补给 仓库→R-08', eta: '5min', color: '#00ff88', hasActions: true },
  ]

  const stats = [
    { label: '总任务数', value: '47', color: '#00d4ff' },
    { label: '完成任务', value: '41', color: '#00ff88' },
    { label: '平均耗时', value: '4.2min', color: '#ffb800' },
    { label: '总行驶距离', value: '2.8km', color: '#7b61ff' },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', gap: 16,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 左侧平面图 60% */}
      <div style={{ flex: '0 0 60%', ...glass, padding: '14px 16px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>实验室平面图（实时AGV位置）</div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <svg viewBox="0 0 700 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* 边框 */}
            <rect x="20" y="20" width="660" height="460" rx="8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

            {/* 区域：反应区（左上） */}
            <rect x="24" y="24" width="310" height="210" rx="4" fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.15)" strokeWidth="1" />
            <text x="120" y="50" textAnchor="middle" fill="rgba(0,212,255,0.6)" fontSize="11" fontFamily="'JetBrains Mono',monospace">反应区</text>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={`r${i}`} x={36 + (i % 4) * 68} y={60 + Math.floor(i / 4) * 58} width="42" height="36" rx="4"
                fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <text key={`rt${i}`} x={57 + (i % 4) * 68} y={82 + Math.floor(i / 4) * 58}
                textAnchor="middle" fill="rgba(0,212,255,0.7)" fontSize="8" fontFamily="'JetBrains Mono',monospace">
                R-{String(i + 1).padStart(2, '0')}
              </text>
            ))}

            {/* 区域：分析区（右上） */}
            <rect x="338" y="24" width="342" height="210" rx="4" fill="rgba(123,97,255,0.04)" stroke="rgba(123,97,255,0.15)" strokeWidth="1" />
            <text x="510" y="50" textAnchor="middle" fill="rgba(123,97,255,0.6)" fontSize="11" fontFamily="'JetBrains Mono',monospace">分析区</text>
            {[{ id: 'GPC-01', x: 360, y: 65 }, { id: 'DSC-01', x: 450, y: 65 }, { id: 'NMR-01', x: 540, y: 65 }, { id: 'FTIR', x: 630, y: 65 }].map(d => (
              <g key={d.id}>
                <rect x={d.x - 30} y={d.y} width="60" height="45" rx="4" fill="rgba(123,97,255,0.12)" stroke="rgba(123,97,255,0.4)" strokeWidth="1" />
                <text x={d.x} y={d.y + 16} textAnchor="middle" fill="rgba(123,97,255,0.8)" fontSize="8" fontFamily="'JetBrains Mono',monospace">{d.id}</text>
                <text x={d.x} y={d.y + 30} textAnchor="middle" fill="rgba(123,97,255,0.5)" fontSize="7">在线</text>
              </g>
            ))}

            {/* 区域：物料仓储区（左下） */}
            <rect x="24" y="238" width="310" height="238" rx="4" fill="rgba(0,255,136,0.03)" stroke="rgba(0,255,136,0.12)" strokeWidth="1" />
            <text x="120" y="260" textAnchor="middle" fill="rgba(0,255,136,0.5)" fontSize="11" fontFamily="'JetBrains Mono',monospace">物料仓储区</text>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={`shelf${i}`} x={36 + (i % 3) * 98} y={270 + Math.floor(i / 3) * 90} width="72" height="70" rx="4"
                fill="rgba(0,255,136,0.06)" stroke="rgba(0,255,136,0.2)" strokeWidth="1" />
            ))}
            <text x="120" y="450" textAnchor="middle" fill="rgba(0,255,136,0.4)" fontSize="9">MAO / ZrCl₂ / 甲苯 / 丙烯</text>

            {/* 区域：废液处理区（右下） */}
            <rect x="338" y="238" width="342" height="238" rx="4" fill="rgba(255,71,87,0.03)" stroke="rgba(255,71,87,0.1)" strokeWidth="1" />
            <text x="510" y="260" textAnchor="middle" fill="rgba(255,71,87,0.5)" fontSize="11" fontFamily="'JetBrains Mono',monospace">废液处理区</text>
            <rect x="360" y="275" width="120" height="80" rx="6" fill="rgba(255,71,87,0.06)" stroke="rgba(255,71,87,0.25)" strokeWidth="1" />
            <text x="420" y="320" textAnchor="middle" fill="rgba(255,71,87,0.6)" fontSize="10">废液收集桶</text>
            {/* 充电站 */}
            <rect x="520" y="310" width="120" height="70" rx="6" fill="rgba(255,184,0,0.06)" stroke="rgba(255,184,0,0.3)" strokeWidth="1" />
            <text x="580" y="330" textAnchor="middle" fill="rgba(255,184,0,0.8)" fontSize="9" fontFamily="'JetBrains Mono',monospace">充电站</text>
            <rect x="540" y="338" width="30" height="28" rx="3" fill="rgba(255,184,0,0.15)" stroke="rgba(255,184,0,0.5)" strokeWidth="1" />
            <text x="555" y="356" textAnchor="middle" fill="#ffb800" fontSize="11">⚡</text>
            <rect x="590" y="338" width="30" height="28" rx="3" fill="rgba(255,184,0,0.15)" stroke="rgba(255,184,0,0.5)" strokeWidth="1" />
            <text x="605" y="356" textAnchor="middle" fill="#ffb800" fontSize="11">⚡</text>

            {/* AGV 行驶路径（虚线） */}
            <path d="M130,120 Q240,100 350,200 Q420,280 400,380" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
            <path d="M550,100 Q480,180 400,250 Q350,300 280,320" fill="none" stroke="rgba(0,255,136,0.12)" strokeWidth="1.5" strokeDasharray="6 4" />
            <path d="M100,380 Q200,340 300,280 Q400,230 480,260 Q540,280 580,380" fill="none" stroke="rgba(255,184,0,0.12)" strokeWidth="1.5" strokeDasharray="6 4" />

            {/* AGV 实体 */}
            {agvPos.map((agv, idx) => {
              const colors = ['#00d4ff', '#6b8aad', '#00ff88']
              const labels = ['AGV-001', 'AGV-002', 'AGV-003']
              const tasks = ['取样', '待命', '补给']
              const c = colors[idx]
              return (
                <g key={idx} transform={`translate(${agv.x},${agv.y}) rotate(${agv.angle})`}>
                  <rect x="-12" y="-8" width="24" height="16" rx="3" fill={`${c}20`} stroke={c} strokeWidth="1.5" />
                  <polygon points="14,0 10,-4 10,4" fill={c} />
                  <g transform="rotate(0)">
                    <rect x="-30" y="-20" width="60" height="14" rx="3" fill="rgba(8,12,24,0.85)" stroke={c} strokeWidth="0.8" />
                    <text x="0" y="-9" textAnchor="middle" fill={c} fontSize="7" fontFamily="'JetBrains Mono',monospace">{labels[idx]}: {tasks[idx]}</text>
                  </g>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* 右侧 40% */}
      <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {/* 任务队列 */}
        <div style={{ ...glass, padding: '14px 16px' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>任务队列</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agvConfigs.map(agv => (
              <div key={agv.id} style={{
                padding: '10px 12px', borderRadius: 8,
                background: `${agv.color}08`, border: `1px solid ${agv.color}25`,
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: agv.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{agv.id}</span>
                  <Tag color={agv.status === '执行中' ? 'processing' : 'default'} style={{ margin: 0, fontSize: 10 }}>{agv.status}</Tag>
                  {agv.eta !== '—' && <span style={{ color: '#6b8aad', fontSize: 10, marginLeft: 'auto' }}>ETA {agv.eta}</span>}
                </div>
                <div style={{ color: '#e8f4ff', fontSize: 11 }}>{agv.task}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {agv.hasActions ? (
                    <>
                      <Button size="small" icon={<PauseCircleOutlined />} style={{ fontSize: 10 }}>暂停</Button>
                      <Button size="small" icon={<CloseCircleOutlined />} danger style={{ fontSize: 10 }}>取消</Button>
                    </>
                  ) : (
                    <Button size="small" type="primary" icon={<SendOutlined />} ghost style={{ fontSize: 10 }}>派遣任务</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日统计 */}
        <div style={{ ...glass, padding: '14px 16px' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>今日统计</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ color: s.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 路径热力图 */}
        <div style={{ ...glass, padding: '14px 16px', flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>路径热力图（过去8h活动密度）</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ReactECharts option={getHeatmapOption()} style={{ height: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
