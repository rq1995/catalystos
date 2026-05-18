import { useState } from 'react'
import { Table, Input, Button } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { chemDB } from '../../mock/data'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

export default function ChemDB() {
  const [formulaSearch, setFormulaSearch] = useState('')
  const [smilesSearch, setSmilesSearch] = useState('')

  const filtered = chemDB.filter(r => {
    const matchFormula = !formulaSearch || r.formula.toLowerCase().includes(formulaSearch.toLowerCase())
    const matchSmiles = !smilesSearch || r.smiles.toLowerCase().includes(smilesSearch.toLowerCase())
    return matchFormula && matchSmiles
  })

  const columns = [
    {
      title: 'CID', dataIndex: 'cid', width: 90,
      render: (v: number) => <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v}</span>,
    },
    {
      title: '分子式', dataIndex: 'formula', width: 130,
      render: (v: string) => <span style={{ color: '#e8f4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'SMILES', dataIndex: 'smiles', width: 180,
      render: (v: string) => (
        <span style={{ color: '#6b8aad', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}
          title={v}>{v.length > 24 ? v.slice(0, 24) + '…' : v}</span>
      ),
    },
    {
      title: '分子量', dataIndex: 'mw', width: 90,
      render: (v: string) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: '精确质量', dataIndex: 'exactMw', width: 100,
      render: (v: string) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'XLogP', dataIndex: 'xlogP', width: 80,
      render: (v: string) => <span style={{ color: parseFloat(v) > 0 ? '#00ff88' : '#ff4757', fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'TPSA (Å²)', dataIndex: 'tpsa', width: 90,
      render: (v: string) => <span style={{ color: '#ffb800', fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'H供体', dataIndex: 'hbDonor', width: 64,
      render: (v: number) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'H受体', dataIndex: 'hbAcceptor', width: 64,
      render: (v: number) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: '重原子', dataIndex: 'heavyAtoms', width: 64,
      render: (v: number) => <span style={{ color: '#7b61ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: '芳香环', dataIndex: 'aromatic', width: 64,
      render: (v: number) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span>,
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: () => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="link" size="small" icon={<EditOutlined />} style={{ color: '#00d4ff', padding: '0 4px' }} />
          <Button type="link" size="small" icon={<DeleteOutlined />} style={{ color: '#ff4757', padding: '0 4px' }} />
        </div>
      ),
    },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 顶部搜索栏 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 600 }}>物化数据库</span>
        <div style={{ flex: 1 }} />
        <Input
          prefix={<SearchOutlined style={{ color: '#6b8aad' }} />}
          placeholder="分子式搜索（如 C58H94O6）"
          value={formulaSearch}
          onChange={e => setFormulaSearch(e.target.value)}
          style={{ width: 220 }}
          size="small"
          allowClear
        />
        <Input
          prefix={<SearchOutlined style={{ color: '#6b8aad' }} />}
          placeholder="SMILES 搜索"
          value={smilesSearch}
          onChange={e => setSmilesSearch(e.target.value)}
          style={{ width: 220 }}
          size="small"
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} size="small">新增</Button>
      </div>

      {/* 统计信息 */}
      <div style={{ ...glass, padding: '10px 16px', display: 'flex', gap: 24, alignItems: 'center', flexShrink: 0 }}>
        {[
          { label: '数据库总量', value: '1,199,992 条', color: '#00d4ff' },
          { label: '已关联实验', value: '156 条', color: '#00ff88' },
          { label: '今日新增', value: '2,841 条', color: '#ffb800' },
          { label: '覆盖分子量范围', value: '58 ~ 842 Da', color: '#7b61ff' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#6b8aad', fontSize: 10 }}>{item.label}</span>
            <span style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700 }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* 数据表格 */}
      <div style={{ ...glass, padding: '14px 16px', flex: 1, overflow: 'auto' }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="cid"
          size="small"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showTotal: () => '共 1,199,992 条',
            style: { color: '#6b8aad' },
          }}
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  )
}
