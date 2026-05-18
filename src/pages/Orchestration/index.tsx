import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  BackgroundVariant,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button, Modal, Popover, InputNumber, Form, List, message, Typography, Space, Divider } from 'antd'
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

// ─────────────────────────────────────────────
// Node type definitions
// ─────────────────────────────────────────────
interface NodeData {
  label: string
  color: string
  icon: string
  params?: Record<string, number>
}

const nodeTypeList = [
  { type: 'gasExchange',     label: '气密置换',     color: '#1677ff', icon: '💨' },
  { type: 'solventAdd',      label: '溶剂加料',     color: '#00d4ff', icon: '🧪' },
  { type: 'monomerAdd',      label: '单体加料',     color: '#00ff88', icon: '⚗️'  },
  { type: 'cocatalystInj',   label: '助催化剂注入', color: '#7b61ff', icon: '💉' },
  { type: 'catalystInj',     label: '催化剂注入',   color: '#ffb800', icon: '🔬' },
  { type: 'polymerization',  label: '恒温恒压聚合', color: '#ff7849', icon: '🌡️' },
  { type: 'quench',          label: '淬灭/终止',    color: '#ff4757', icon: '❄️'  },
  { type: 'detection',       label: '产物检测',     color: '#00ff88', icon: '📊' },
]

// ─────────────────────────────────────────────
// Custom Node Component
// ─────────────────────────────────────────────
function CustomNode({ data, selected }: { data: NodeData; selected: boolean }) {
  const [popOpen, setPopOpen] = useState(false)

  const paramContent = (
    <div style={{ width: 240, padding: 4 }}>
      <Form layout="vertical" size="small">
        <Form.Item label={<Text style={{ color: '#e8f4ff' }}>温度 (°C)</Text>}>
          <InputNumber
            defaultValue={data.params?.temp ?? 65}
            min={0} max={200} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: '#e8f4ff' }}
          />
        </Form.Item>
        <Form.Item label={<Text style={{ color: '#e8f4ff' }}>压力 (MPa)</Text>}>
          <InputNumber
            defaultValue={data.params?.pressure ?? 0.6}
            min={0} max={5} step={0.01} style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label={<Text style={{ color: '#e8f4ff' }}>时长 (min)</Text>}>
          <InputNumber
            defaultValue={data.params?.duration ?? 90}
            min={0} max={600} style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </div>
  )

  return (
    <Popover
      open={popOpen}
      onOpenChange={setPopOpen}
      content={paramContent}
      title={<span style={{ color: '#e8f4ff' }}>参数配置 - {data.label}</span>}
      trigger="click"
      overlayStyle={{ '--ant-color-bg-elevated': '#0d1525' } as React.CSSProperties}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${selected ? data.color : 'rgba(255,255,255,0.12)'}`,
          borderLeft: `4px solid ${data.color}`,
          borderRadius: 8,
          padding: '8px 14px',
          cursor: 'pointer',
          minWidth: 140,
          boxShadow: selected ? `0 0 12px ${data.color}44` : 'none',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{data.icon}</span>
          <span style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 500 }}>{data.label}</span>
        </div>
        {data.params && (
          <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 4 }}>
            {data.params.temp}°C · {data.params.pressure}MPa · {data.params.duration}min
          </div>
        )}
      </div>
    </Popover>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// ─────────────────────────────────────────────
// Default nodes / edges for standard flow
// ─────────────────────────────────────────────
function buildStandardNodes(): Node[] {
  return nodeTypeList.map((nt, i) => ({
    id: `n${i + 1}`,
    type: 'custom',
    position: { x: 60 + i * 175, y: 220 },
    data: {
      label: nt.label,
      color: nt.color,
      icon: nt.icon,
      params: { temp: 65, pressure: 0.6, duration: 90 },
    },
  }))
}

function buildStandardEdges(): Edge[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: `e${i + 1}`,
    source: `n${i + 1}`,
    target: `n${i + 2}`,
    animated: true,
    style: { stroke: '#00d4ff', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' },
  }))
}

const initialNodes = buildStandardNodes()
const initialEdges = buildStandardEdges()

// ─────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────
const templates = [
  { name: '标准聚合方案', desc: '8步流程', build: () => ({ nodes: buildStandardNodes(), edges: buildStandardEdges() }) },
  {
    name: '高通量筛选方案', desc: '5步并行', build: () => ({
      nodes: [
        { id: 'h1', type: 'custom', position: { x: 80, y: 200 }, data: { label: '气密置换', color: '#1677ff', icon: '💨', params: { temp: 25, pressure: 0.3, duration: 10 } } },
        { id: 'h2', type: 'custom', position: { x: 280, y: 120 }, data: { label: '溶剂加料', color: '#00d4ff', icon: '🧪', params: { temp: 25, pressure: 0.1, duration: 5 } } },
        { id: 'h3', type: 'custom', position: { x: 280, y: 280 }, data: { label: '单体加料', color: '#00ff88', icon: '⚗️', params: { temp: 25, pressure: 0.1, duration: 5 } } },
        { id: 'h4', type: 'custom', position: { x: 500, y: 200 }, data: { label: '并行聚合', color: '#ff7849', icon: '🌡️', params: { temp: 60, pressure: 0.5, duration: 60 } } },
        { id: 'h5', type: 'custom', position: { x: 700, y: 200 }, data: { label: '产物检测', color: '#00ff88', icon: '📊', params: { temp: 25, pressure: 0.1, duration: 30 } } },
      ] as Node[],
      edges: [
        { id: 'he1', source: 'h1', target: 'h2', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
        { id: 'he2', source: 'h1', target: 'h3', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
        { id: 'he3', source: 'h2', target: 'h4', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
        { id: 'he4', source: 'h3', target: 'h4', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
        { id: 'he5', source: 'h4', target: 'h5', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
      ] as Edge[],
    })
  },
  {
    name: '表征分析方案', desc: '3步分析', build: () => ({
      nodes: [
        { id: 'a1', type: 'custom', position: { x: 100, y: 220 }, data: { label: '产物取样', color: '#7b61ff', icon: '🔬', params: { temp: 25, pressure: 0.1, duration: 10 } } },
        { id: 'a2', type: 'custom', position: { x: 360, y: 220 }, data: { label: 'GPC 分析', color: '#00d4ff', icon: '📈', params: { temp: 150, pressure: 0.1, duration: 45 } } },
        { id: 'a3', type: 'custom', position: { x: 620, y: 220 }, data: { label: 'DSC 热分析', color: '#ffb800', icon: '🌡️', params: { temp: 200, pressure: 0.1, duration: 30 } } },
      ] as Node[],
      edges: [
        { id: 'ae1', source: 'a1', target: 'a2', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
        { id: 'ae2', source: 'a2', target: 'a3', animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } },
      ] as Edge[],
    })
  },
]

const versionHistory = [
  { ver: 'v1.3', time: '2024-05-18 14:23', user: '张研究员' },
  { ver: 'v1.2', time: '2024-05-18 11:05', user: '李工程师' },
  { ver: 'v1.1', time: '2024-05-17 09:40', user: '王科学家' },
]

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Orchestration() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [confirmModal, setConfirmModal] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<{ screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } } | null>(null)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00d4ff' } }, eds)
      ),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const typeData = event.dataTransfer.getData('application/reactflow')
      if (!typeData || !reactFlowInstance) return
      const nodeInfo = JSON.parse(typeData) as (typeof nodeTypeList)[0]
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const newNode: Node = {
        id: `n_${Date.now()}`,
        type: 'custom',
        position,
        data: { label: nodeInfo.label, color: nodeInfo.color, icon: nodeInfo.icon, params: { temp: 65, pressure: 0.6, duration: 90 } },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const loadTemplate = (tpl: (typeof templates)[0]) => {
    const { nodes: n, edges: e } = tpl.build()
    setNodes(n)
    setEdges(e)
    message.success(`已加载模板：${tpl.name}`)
  }

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orchestration_flow.json'
    a.click()
  }

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#080c18', overflow: 'hidden' }}>

      {/* Left: Node Library */}
      <div style={{ width: 200, flexShrink: 0, padding: 16, borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Title level={5} style={{ color: '#e8f4ff', margin: '0 0 12px' }}>
          <FundProjectionScreenOutlined style={{ color: '#00d4ff', marginRight: 6 }} />
          节点库
        </Title>
        {nodeTypeList.map((nt) => (
          <div
            key={nt.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', JSON.stringify(nt))
              e.dataTransfer.effectAllowed = 'move'
            }}
            style={{
              ...glass,
              padding: '8px 10px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderLeft: `3px solid ${nt.color}`,
              borderRadius: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <span style={{ fontSize: 16 }}>{nt.icon}</span>
            <span style={{ color: '#e8f4ff', fontSize: 12 }}>{nt.label}</span>
          </div>
        ))}
      </div>

      {/* Center: ReactFlow Canvas */}
      <div ref={reactFlowWrapper} style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(inst) => setReactFlowInstance(inst as typeof reactFlowInstance)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#080c18' }}
          defaultEdgeOptions={{ animated: true, style: { stroke: '#00d4ff', strokeWidth: 2 } }}
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.06)" gap={24} />
          <Controls style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Panel position="top-center">
            <div style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '4px 16px', color: '#00d4ff', fontSize: 13 }}>
              拖拽节点到画布 · 点击节点配置参数 · 连接节点建立流程
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right: Toolbar */}
      <div style={{ width: 200, flexShrink: 0, padding: 16, borderLeft: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Templates */}
        <div style={glass as React.CSSProperties}>
          <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e8f4ff', fontWeight: 600, fontSize: 13 }}>
            <ExperimentOutlined style={{ color: '#00d4ff', marginRight: 6 }} />模板库
          </div>
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {templates.map((tpl) => (
              <Button
                key={tpl.name}
                size="small"
                block
                onClick={() => loadTemplate(tpl)}
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', textAlign: 'left', height: 'auto', padding: '4px 8px', whiteSpace: 'normal', lineHeight: 1.4 }}
              >
                <div style={{ fontSize: 12 }}>{tpl.name}</div>
                <div style={{ fontSize: 10, color: '#6b8aad' }}>{tpl.desc}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Version History */}
        <div style={glass as React.CSSProperties}>
          <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e8f4ff', fontWeight: 600, fontSize: 13 }}>
            <HistoryOutlined style={{ color: '#7b61ff', marginRight: 6 }} />版本历史
          </div>
          <List
            size="small"
            dataSource={versionHistory}
            renderItem={(item) => (
              <List.Item style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ color: '#00d4ff', fontSize: 12 }}>{item.ver}</div>
                  <div style={{ color: '#6b8aad', fontSize: 10 }}>{item.time}</div>
                  <div style={{ color: '#6b8aad', fontSize: 10 }}>{item.user}</div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

        {/* Export */}
        <Button
          icon={<DownloadOutlined />}
          block
          onClick={handleExport}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8f4ff' }}
        >
          导出 JSON
        </Button>

        {/* Execute */}
        <Button
          icon={<PlayCircleOutlined />}
          block
          size="large"
          onClick={() => setConfirmModal(true)}
          style={{
            background: 'linear-gradient(135deg, #00d4ff22, #00ff8822)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            fontWeight: 700,
            height: 48,
          }}
        >
          下发执行
        </Button>
      </div>

      {/* Confirm Modal */}
      <Modal
        open={confirmModal}
        onCancel={() => setConfirmModal(false)}
        onOk={() => { message.success('流程已下发执行！'); setConfirmModal(false) }}
        okText="确认下发"
        cancelText="取消"
        title={<span style={{ color: '#e8f4ff' }}>确认下发执行</span>}
        okButtonProps={{ style: { background: '#00ff88', borderColor: '#00ff88', color: '#080c18', fontWeight: 700 } }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ color: '#e8f4ff' }}>当前流程包含 <strong style={{ color: '#00d4ff' }}>{nodes.length}</strong> 个节点，<strong style={{ color: '#00d4ff' }}>{edges.length}</strong> 条连接。</div>
          <div style={{ color: '#ffb800', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', padding: '8px 12px', borderRadius: 6 }}>
            <ThunderboltOutlined /> 下发后将立即在实体设备上执行，请确认流程无误。
          </div>
        </Space>
      </Modal>
    </div>
  )
}
