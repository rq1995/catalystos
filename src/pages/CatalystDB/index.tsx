import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Input, Select, Slider, Button, Table, Tag, Modal, Space,
  Typography, Tooltip, Badge,
} from 'antd'
import {
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { catalysts } from '../../mock/data'

const { Title, Text } = Typography

type Catalyst = typeof catalysts[0]

// ─────────────────────────────────────────────
// Metal colors
// ─────────────────────────────────────────────
const metalColor: Record<string, string> = {
  Zr: '#00d4ff',
  Hf: '#7b61ff',
  Ti: '#ff7849',
}
const sourceColor: Record<string, string> = {
  experiment: '#00ff88',
  literature: '#00d4ff',
  simulation: '#ffb800',
}
const sourceLabel: Record<string, string> = {
  experiment: '实验',
  literature: '文献',
  simulation: '模拟',
}

// ─────────────────────────────────────────────
// Molecule Canvas
// ─────────────────────────────────────────────
function MolCanvas({ metal }: { metal: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 100, 120)

    const color = metalColor[metal] ?? '#00d4ff'

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 0, 100, 120)

    // Draw two ellipses (Cp ligands)
    // Upper-left Cp
    ctx.beginPath()
    ctx.ellipse(32, 42, 22, 10, -0.5, 0, Math.PI * 2)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.85
    ctx.stroke()

    // Upper-right Cp
    ctx.beginPath()
    ctx.ellipse(68, 42, 22, 10, 0.5, 0, Math.PI * 2)
    ctx.stroke()

    // Center metal point
    ctx.beginPath()
    ctx.arc(50, 62, 7, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.7
    ctx.fill()
    ctx.globalAlpha = 1

    // Metal symbol text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(metal, 50, 66)

    // Lines from metal to Cp centers
    ctx.beginPath()
    ctx.moveTo(50, 55)
    ctx.lineTo(32, 50)
    ctx.strokeStyle = `${color}88`
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(50, 55)
    ctx.lineTo(68, 50)
    ctx.stroke()

    // Two Cl lines at bottom
    // Cl-left
    ctx.beginPath()
    ctx.moveTo(50, 69)
    ctx.lineTo(30, 92)
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#aaa'
    ctx.font = '9px monospace'
    ctx.fillText('Cl', 24, 100)

    // Cl-right
    ctx.beginPath()
    ctx.moveTo(50, 69)
    ctx.lineTo(70, 92)
    ctx.stroke()
    ctx.fillText('Cl', 68, 100)

    // Glow effect
    ctx.beginPath()
    ctx.arc(50, 62, 12, 0, Math.PI * 2)
    const grad = ctx.createRadialGradient(50, 62, 0, 50, 62, 12)
    grad.addColorStop(0, `${color}33`)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fill()
  }, [metal])

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={120}
      style={{ display: 'block', margin: '0 auto', borderRadius: '4px 4px 0 0' }}
    />
  )
}

// ─────────────────────────────────────────────
// Catalyst Card
// ─────────────────────────────────────────────
function CatalystCard({ cat, onVerify }: { cat: Catalyst; onVerify: (cat: Catalyst) => void }) {
  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }

  const [hovered, setHovered] = useState(false)
  const color = metalColor[cat.metal] ?? '#00d4ff'

  return (
    <div
      style={{
        ...glass,
        borderColor: hovered ? color : 'rgba(255,255,255,0.08)',
        boxShadow: hovered ? `0 4px 24px ${color}22` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Molecule canvas area */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 0 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <MolCanvas metal={cat.metal} />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={{ color: '#6b8aad', fontSize: 11 }}>{cat.id}</Text>
          <Space size={4}>
            <Tag color={cat.metal === 'Zr' ? 'cyan' : cat.metal === 'Hf' ? 'purple' : 'orange'} style={{ margin: 0, fontSize: 10, padding: '0 6px' }}>
              {cat.metal}
            </Tag>
            <Tag style={{ margin: 0, fontSize: 10, padding: '0 6px', background: `${sourceColor[cat.source]}18`, borderColor: `${sourceColor[cat.source]}44`, color: sourceColor[cat.source] }}>
              {sourceLabel[cat.source]}
            </Tag>
          </Space>
        </div>

        <div style={{ marginBottom: 10 }}>
          <Text style={{ color: '#6b8aad', fontSize: 11 }}>助催化剂</Text>
          <Text style={{ color: '#e8f4ff', fontSize: 12, marginLeft: 8 }}>{cat.cocatalyst}</Text>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 2 }}>催化活性</div>
          <div style={{ color: '#00d4ff', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
            {cat.activity.toLocaleString()}
          </div>
          <div style={{ color: '#6b8aad', fontSize: 10 }}>kg/mol·h</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
          {[
            { label: 'PDI',   value: cat.pdi.toFixed(1) },
            { label: 'Tm',    value: `${cat.tm.toFixed(1)}°C` },
            { label: '插入率', value: `${cat.insertion}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 6px', textAlign: 'center' }}>
              <div style={{ color: '#6b8aad', fontSize: 9 }}>{label}</div>
              <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
            <Text style={{ color: '#6b8aad' }}>可信度</Text>
            <Text style={{ color: '#e8f4ff' }}>{(cat.confidence * 100).toFixed(0)}%</Text>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
            <div style={{ width: `${cat.confidence * 100}%`, height: 4, borderRadius: 4, background: cat.confidence > 0.9 ? '#00ff88' : cat.confidence > 0.75 ? '#00d4ff' : '#ffb800', transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<EyeOutlined />}
            size="small"
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8f4ff', fontSize: 11 }}
          >
            查看详情
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            size="small"
            onClick={() => onVerify(cat)}
            style={{ flex: 1, background: `${color}18`, border: `1px solid ${color}44`, color, fontSize: 11 }}
          >
            发起验证
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────
const columns = [
  { title: '催化剂ID', dataIndex: 'id', key: 'id', width: 150, render: (v: string) => <Text style={{ color: '#00d4ff', fontSize: 12 }}>{v}</Text> },
  { title: 'SMILES', dataIndex: 'smiles', key: 'smiles', width: 220, ellipsis: true, render: (v: string) => <Tooltip title={v}><Text style={{ color: '#6b8aad', fontSize: 11 }}>{v}</Text></Tooltip> },
  { title: '金属中心', dataIndex: 'metal', key: 'metal', width: 90, render: (v: string) => <Tag color={v === 'Zr' ? 'cyan' : v === 'Hf' ? 'purple' : 'orange'}>{v}</Tag> },
  { title: '助催化剂', dataIndex: 'cocatalyst', key: 'cocatalyst', width: 90, render: (v: string) => <Text style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</Text> },
  { title: '活性 (kg/mol·h)', dataIndex: 'activity', key: 'activity', width: 130, sorter: (a: Catalyst, b: Catalyst) => a.activity - b.activity, render: (v: number) => <Text style={{ color: '#00d4ff', fontWeight: 700 }}>{v.toLocaleString()}</Text> },
  { title: 'PDI', dataIndex: 'pdi', key: 'pdi', width: 70, sorter: (a: Catalyst, b: Catalyst) => a.pdi - b.pdi, render: (v: number) => <Text style={{ color: '#e8f4ff' }}>{v.toFixed(1)}</Text> },
  { title: 'Tm (°C)', dataIndex: 'tm', key: 'tm', width: 90, sorter: (a: Catalyst, b: Catalyst) => a.tm - b.tm, render: (v: number) => <Text style={{ color: '#e8f4ff' }}>{v.toFixed(1)}</Text> },
  { title: '插入率 (%)', dataIndex: 'insertion', key: 'insertion', width: 90, render: (v: number) => <Text style={{ color: '#e8f4ff' }}>{v}</Text> },
  {
    title: '来源', dataIndex: 'source', key: 'source', width: 80,
    render: (v: string) => <Tag style={{ background: `${sourceColor[v]}18`, borderColor: `${sourceColor[v]}44`, color: sourceColor[v] }}>{sourceLabel[v]}</Tag>,
  },
  {
    title: '可信度', dataIndex: 'confidence', key: 'confidence', width: 90, sorter: (a: Catalyst, b: Catalyst) => a.confidence - b.confidence,
    render: (v: number) => <Text style={{ color: v > 0.9 ? '#00ff88' : v > 0.75 ? '#00d4ff' : '#ffb800' }}>{(v * 100).toFixed(0)}%</Text>,
  },
  {
    title: '操作', key: 'actions', width: 120, fixed: 'right' as const,
    render: (_: unknown, rec: Catalyst) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#e8f4ff' }} />
        <Button size="small" icon={<ThunderboltOutlined />} style={{ background: 'rgba(0,212,255,0.1)', border: 'none', color: '#00d4ff' }} />
      </Space>
    ),
  },
]

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function CatalystDB() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [search, setSearch] = useState('')
  const [metalFilter, setMetalFilter] = useState<string>('all')
  const [activityRange, setActivityRange] = useState<[number, number]>([0, 15000])
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [verifyModal, setVerifyModal] = useState<Catalyst | null>(null)

  const filtered = catalysts.filter((c) => {
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.metal.toLowerCase().includes(search.toLowerCase())
    const matchMetal = metalFilter === 'all' || c.metal === metalFilter
    const matchActivity = c.activity >= activityRange[0] && c.activity <= activityRange[1]
    const matchSource = sourceFilter === 'all' || c.source === sourceFilter
    return matchSearch && matchMetal && matchActivity && matchSource
  })

  const handleVerify = useCallback((cat: Catalyst) => {
    setVerifyModal(cat)
  }, [])

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    backdropFilter: 'blur(12px)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080c18', overflow: 'hidden', padding: 16, gap: 12 }}>

      {/* Search Bar */}
      <div style={{ ...glass, padding: '14px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

          <Input
            prefix={<SearchOutlined style={{ color: '#6b8aad' }} />}
            placeholder="搜索催化剂ID、金属中心..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#e8f4ff' }}
            allowClear
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#6b8aad', fontSize: 12, whiteSpace: 'nowrap' }}>金属中心</Text>
            <Select
              value={metalFilter}
              onChange={setMetalFilter}
              style={{ width: 110 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'Zr', label: 'Zr' },
                { value: 'Hf', label: 'Hf' },
                { value: 'Ti', label: 'Ti' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px', minWidth: 200 }}>
            <Text style={{ color: '#6b8aad', fontSize: 12, whiteSpace: 'nowrap' }}>活性范围</Text>
            <Slider
              range
              min={0} max={15000} step={100}
              value={activityRange}
              onChange={(v) => setActivityRange(v as [number, number])}
              style={{ flex: 1 }}
              tooltip={{ formatter: (v) => `${v?.toLocaleString()} kg/mol·h` }}
            />
            <Text style={{ color: '#6b8aad', fontSize: 11, whiteSpace: 'nowrap' }}>{activityRange[0].toLocaleString()}–{activityRange[1].toLocaleString()}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#6b8aad', fontSize: 12, whiteSpace: 'nowrap' }}>数据来源</Text>
            <Select
              value={sourceFilter}
              onChange={setSourceFilter}
              style={{ width: 100 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'experiment', label: '实验' },
                { value: 'literature', label: '文献' },
                { value: 'simulation', label: '模拟' },
              ]}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'card' ? 'primary' : 'default'}
              onClick={() => setViewMode('card')}
              style={viewMode !== 'card' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#6b8aad' } : {}}
            >
              卡片
            </Button>
            <Button
              icon={<TableOutlined />}
              type={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
              style={viewMode !== 'table' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#6b8aad' } : {}}
            >
              表格
            </Button>
          </div>

          <Text style={{ color: '#6b8aad', fontSize: 12 }}>
            共 <strong style={{ color: '#00d4ff' }}>{filtered.length}</strong> 条
          </Text>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {viewMode === 'card' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            padding: 2,
          }}>
            {filtered.map((cat) => (
              <CatalystCard key={cat.id} cat={cat} onVerify={handleVerify} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#6b8aad' }}>
                <ExperimentOutlined style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
                暂无匹配的催化剂数据
              </div>
            )}
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            size="small"
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            style={{ background: 'transparent' }}
            className="dark-table"
            rowClassName={() => 'dark-row'}
          />
        )}
      </div>

      {/* Verify Modal */}
      <Modal
        open={!!verifyModal}
        title={<span style={{ color: '#e8f4ff' }}>发起验证实验</span>}
        onCancel={() => setVerifyModal(null)}
        onOk={() => {
          setVerifyModal(null)
          navigate('/ai-recommend')
        }}
        okText="跳转 AI 推荐"
        cancelText="取消"
        okButtonProps={{ style: { background: '#00d4ff', borderColor: '#00d4ff', color: '#080c18', fontWeight: 700 } }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
      >
        {verifyModal && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
              <MolCanvas metal={verifyModal.metal} />
              <div>
                <div style={{ color: '#00d4ff', fontSize: 16, fontWeight: 700 }}>{verifyModal.id}</div>
                <div style={{ color: '#6b8aad', fontSize: 12, marginTop: 4 }}>金属中心: {verifyModal.metal}</div>
                <div style={{ color: '#6b8aad', fontSize: 12 }}>助催化剂: {verifyModal.cocatalyst}</div>
                <div style={{ color: '#6b8aad', fontSize: 12 }}>活性: {verifyModal.activity.toLocaleString()} kg/mol·h</div>
              </div>
            </div>
            <div style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '10px 14px', color: '#00d4ff', fontSize: 13 }}>
              将跳转至 AI 推荐页面，为该催化剂生成最优实验方案。
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
