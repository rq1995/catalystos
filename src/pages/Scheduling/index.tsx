import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import {
  Button, DatePicker, Modal, Form, Input, Select, Space, Typography, Spin,
} from 'antd'
import {
  ReloadOutlined,
  PlusOutlined,
  RobotOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// ─────────────────────────────────────────────
// Mock Gantt data
// ─────────────────────────────────────────────
const statusConfig = {
  running:   { color: 'rgba(0,212,255,0.7)',   label: '运行中' },
  waiting:   { color: 'rgba(255,255,255,0.2)', label: '等待中' },
  completed: { color: 'rgba(0,255,136,0.5)',   label: '已完成' },
  error:     { color: 'rgba(255,71,87,0.5)',   label: '异常'   },
}

type TaskStatus = keyof typeof statusConfig

function genRandomTasks(reactorIdx: number) {
  const tasks: { start: number; end: number; status: TaskStatus; batch: string; catalyst: string; activity: number }[] = []
  let cursor = 0
  const count = 2 + (reactorIdx % 2)
  for (let i = 0; i < count; i++) {
    const gap = 0.3 + Math.random() * 1.5
    const start = cursor + gap
    const duration = 1 + Math.random() * 3
    const end = start + duration
    const statuses: TaskStatus[] = ['running', 'waiting', 'completed', 'error']
    const status = i === 0 && reactorIdx < 28
      ? (reactorIdx % 7 === 3 ? 'error' : 'running')
      : statuses[Math.floor(Math.random() * statuses.length)]
    tasks.push({
      start,
      end: Math.min(end, 24),
      status,
      batch: `BAT-${String(1000 + reactorIdx * 3 + i).padStart(4, '0')}`,
      catalyst: ['CAT-2024-0045', 'CAT-2024-0044', 'CAT-2024-0043', 'CAT-2024-0041'][reactorIdx % 4],
      activity: 7000 + Math.floor(Math.random() * 4000),
    })
    cursor = end
    if (cursor >= 24) break
  }
  return tasks
}

const reactors = Array.from({ length: 32 }, (_, i) => ({
  id: `R-${String(i + 1).padStart(2, '0')}`,
  tasks: genRandomTasks(i),
}))

// ─────────────────────────────────────────────
// ECharts Gantt option
// ─────────────────────────────────────────────
function buildGanttOption() {
  const yData = reactors.map((r) => r.id)

  const series: object[] = []
  reactors.forEach((reactor, yIdx) => {
    reactor.tasks.forEach((task) => {
      const cfg = statusConfig[task.status]
      series.push({
        type: 'custom',
        renderItem: (_params: object, api: {
          value: (idx: number) => number
          coord: (val: [number, number]) => [number, number]
          size: (val: [number, number]) => [number, number]
          style: (opts: object) => object
        }) => {
          const y = api.value(0)
          const x0 = api.coord([api.value(1), y])
          const x1 = api.coord([api.value(2), y])
          const height = api.size([0, 1])[1] * 0.7
          return {
            type: 'rect',
            shape: {
              x: x0[0],
              y: x0[1] - height / 2,
              width: x1[0] - x0[0],
              height,
            },
            style: api.style({
              fill: cfg.color,
              stroke: 'rgba(255,255,255,0.15)',
              lineWidth: 1,
            }),
          }
        },
        data: [[yIdx, task.start, task.end, task]],
        encode: { x: [1, 2], y: 0 },
        tooltip: {
          formatter: (params: { value: [number, number, number, typeof task] }) => {
            const t = params.value[3]
            return [
              `<div style="color:#e8f4ff;font-size:12px">`,
              `<b>${reactor.id}</b> - <span style="color:${statusConfig[t.status].color}">${cfg.label}</span><br/>`,
              `批次: ${t.batch}<br/>`,
              `催化剂: ${t.catalyst}<br/>`,
              `预计活性: ${t.activity} kg/mol·h<br/>`,
              `时段: ${t.start.toFixed(1)}h – ${t.end.toFixed(1)}h (${(t.end - t.start).toFixed(1)}h)`,
              `</div>`,
            ].join('')
          },
        },
      })
    })
  })

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    grid: { left: 68, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 24,
      interval: 2,
      axisLabel: {
        color: '#6b8aad',
        fontSize: 11,
        formatter: (v: number) => `${String(v).padStart(2, '0')}:00`,
      },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    yAxis: {
      type: 'category',
      data: yData,
      inverse: true,
      axisLabel: { color: '#6b8aad', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [
      ...series,
      // Current time marker at 14:30 = 14.5
      {
        type: 'line',
        markLine: {
          silent: false,
          symbol: ['none', 'none'],
          lineStyle: { color: '#ff4757', type: 'dashed', width: 2 },
          label: { show: true, formatter: '14:30', color: '#ff4757', position: 'insideStartTop', fontSize: 11 },
          data: [{ xAxis: 14.5 }],
        },
        data: [],
      },
    ],
  }
}

// ─────────────────────────────────────────────
// Utilization Ring Chart
// ─────────────────────────────────────────────
function UtilRing() {
  const option = {
    backgroundColor: 'transparent',
    series: [{
      type: 'pie',
      radius: ['65%', '85%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: '89.3%',
        color: '#00d4ff',
        fontSize: 14,
        fontWeight: 700,
      },
      data: [
        { value: 89.3, name: '使用', itemStyle: { color: '#00d4ff' } },
        { value: 10.7, name: '空闲', itemStyle: { color: 'rgba(255,255,255,0.06)' } },
      ],
    }],
  }
  return <ReactECharts option={option} style={{ height: 80, width: 80 }} opts={{ renderer: 'canvas' }} />
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Scheduling() {
  const [insertModal, setInsertModal] = useState(false)
  const [replanLoading, setReplanLoading] = useState(false)
  const [ganttOption] = useState(buildGanttOption)
  const [form] = Form.useForm()

  const handleReplan = () => {
    setReplanLoading(true)
    setTimeout(() => setReplanLoading(false), 1500)
  }

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  }

  const decisions = [
    {
      icon: <CloseCircleOutlined style={{ color: '#ff4757' }} />,
      text: '样品 S-023 纯度 82% < 90%',
      sub: '跳过 GPC 精表征（节省 45min）',
      bg: 'rgba(255,71,87,0.06)',
      border: 'rgba(255,71,87,0.2)',
    },
    {
      icon: <StarOutlined style={{ color: '#ffb800' }} />,
      text: '样品 S-019 模型不确定性高',
      sub: '优先 GPC-IR 精表征',
      bg: 'rgba(255,184,0,0.06)',
      border: 'rgba(255,184,0,0.2)',
    },
    {
      icon: <ThunderboltOutlined style={{ color: '#00d4ff' }} />,
      text: 'GPC-01 空闲，匹配 3 个待测样品',
      sub: '排程优化',
      bg: 'rgba(0,212,255,0.06)',
      border: 'rgba(0,212,255,0.2)',
    },
    {
      icon: <SyncOutlined style={{ color: '#00ff88' }} />,
      text: 'R-05 完成，下批次已就绪',
      sub: '自动衔接',
      bg: 'rgba(0,255,136,0.06)',
      border: 'rgba(0,255,136,0.2)',
    },
    {
      icon: <WarningOutlined style={{ color: '#ffb800' }} />,
      text: 'NMR-01 维护窗口 15:00–16:00',
      sub: '相关样品重排',
      bg: 'rgba(255,184,0,0.06)',
      border: 'rgba(255,184,0,0.2)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080c18', overflow: 'hidden', padding: 16, gap: 12 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <DatePicker
          defaultValue={dayjs('2024-05-18')}
          style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#e8f4ff' }}
          allowClear={false}
        />
        <Button
          icon={<ReloadOutlined />}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8f4ff' }}
        >
          刷新
        </Button>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setInsertModal(true)}
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
        >
          手动插单
        </Button>
        <Spin spinning={replanLoading}>
          <Button
            icon={<RobotOutlined />}
            onClick={handleReplan}
            style={{ background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)', color: '#7b61ff' }}
          >
            重新排产
          </Button>
        </Spin>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12 }}>
          {Object.entries(statusConfig).map(([k, v]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b8aad' }}>
              <span style={{ width: 12, height: 10, borderRadius: 2, background: v.color, display: 'inline-block' }} />
              {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, gap: 12, overflow: 'hidden' }}>

        {/* Gantt Chart */}
        <div style={{ flex: '0 0 70%', ...glass, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Title level={5} style={{ color: '#e8f4ff', margin: '0 0 12px' }}>智能排产甘特图 (2024-05-18)</Title>
          <div style={{ flex: 1 }}>
            <ReactECharts
              option={ganttOption}
              style={{ height: '100%', minHeight: 500 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* AI Decisions */}
          <div style={{ ...glass, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <RobotOutlined style={{ color: '#7b61ff', fontSize: 16 }} />
              <Title level={5} style={{ color: '#e8f4ff', margin: 0 }}>调度决策依据 (AI)</Title>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {decisions.map((d, i) => (
                <div key={i} style={{
                  background: d.bg,
                  border: `1px solid ${d.border}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ marginTop: 2 }}>{d.icon}</span>
                    <div>
                      <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 500 }}>{d.text}</div>
                      <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 2 }}>→ {d.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </div>

          {/* Stats */}
          <div style={{ ...glass, padding: 16 }}>
            <Title level={5} style={{ color: '#e8f4ff', margin: '0 0 12px' }}>今日统计</Title>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <UtilRing />
              <div>
                <div style={{ color: '#6b8aad', fontSize: 11 }}>设备利用率</div>
                <div style={{ color: '#00d4ff', fontSize: 22, fontWeight: 700 }}>89.3%</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '今日节省机时', value: '4.7h', color: '#00ff88' },
                { label: '并行实验数',   value: '28',   color: '#00d4ff' },
                { label: '预计完成批次', value: '47',   color: '#ffb800' },
                { label: '异常停机次数', value: '2',    color: '#ff4757' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}>
                  <div style={{ color: '#6b8aad', fontSize: 11 }}>{label}</div>
                  <div style={{ color, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insert Order Modal */}
      <Modal
        open={insertModal}
        title={<span style={{ color: '#e8f4ff' }}>手动插单</span>}
        onCancel={() => setInsertModal(false)}
        onOk={() => { form.resetFields(); setInsertModal(false) }}
        okText="确认插单"
        okButtonProps={{ style: { background: '#00d4ff', borderColor: '#00d4ff', color: '#080c18', fontWeight: 700 } }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label={<Text style={{ color: '#e8f4ff' }}>催化剂 ID</Text>} name="catalyst">
            <Select placeholder="选择催化剂" style={{ width: '100%' }}
              options={['CAT-2024-0045','CAT-2024-0044','CAT-2024-0043','CAT-2024-0041'].map(v => ({ value: v, label: v }))}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ color: '#e8f4ff' }}>指定反应釜</Text>} name="reactor">
            <Select placeholder="自动分配" style={{ width: '100%' }}
              options={Array.from({ length: 32 }, (_, i) => ({ value: `R-${String(i+1).padStart(2,'0')}`, label: `R-${String(i+1).padStart(2,'0')}` }))}
            />
          </Form.Item>
          <Form.Item label={<Text style={{ color: '#e8f4ff' }}>批次备注</Text>} name="note">
            <Input placeholder="输入备注信息" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#e8f4ff' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
