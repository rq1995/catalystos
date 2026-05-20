import { useState } from 'react'
import { Modal, message } from 'antd'
import { pushControlLog } from './controlBus'

interface Props {
  id: string
  name: string
  state: 'open' | 'closed'
  type?: string
  disabled?: boolean
  onToggle: (next: 'open' | 'closed') => void
  compact?: boolean
}

export default function ValveButton({ id, name, state, type, disabled, onToggle, compact }: Props) {
  const [open, setOpen] = useState(false)
  const next: 'open' | 'closed' = state === 'open' ? 'closed' : 'open'
  const isOpen = state === 'open'

  const confirm = () => {
    pushControlLog({
      user: '张研究员',
      device: id,
      action: '阀门切换',
      before: state,
      after: next,
    })
    onToggle(next)
    message.success(`阀门 ${id} 已 ${next === 'open' ? '打开' : '关闭'}`)
    setOpen(false)
  }

  const color = isOpen ? '#00ff88' : '#6b8aad'
  const bg = isOpen ? 'rgba(0,255,136,0.08)' : 'rgba(107,138,173,0.06)'

  if (compact) {
    return (
      <>
        <div
          onClick={() => !disabled && setOpen(true)}
          title={`${name} (${id})`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            background: bg,
            border: `1px solid ${color}`,
            borderRadius: 6,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
          {id} {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={confirm}
          okText={`确认${next === 'open' ? '打开' : '关闭'}`}
          cancelText="取消"
          title={<span style={{ color: '#e8f4ff' }}>阀门控制确认</span>}
          okButtonProps={{ style: { background: next === 'open' ? '#00ff88' : '#ff4757', borderColor: 'transparent', color: '#080c18', fontWeight: 700 } }}
          styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
        >
          <div style={{ color: '#e8f4ff' }}>
            将 <strong style={{ color: '#00d4ff' }}>{name}</strong> ({id}) 由 <span style={{ color }}>{state.toUpperCase()}</span> 切换为 <strong style={{ color: next === 'open' ? '#00ff88' : '#ff4757' }}>{next.toUpperCase()}</strong>
          </div>
        </Modal>
      </>
    )
  }

  return (
    <>
      <div
        onClick={() => !disabled && setOpen(true)}
        style={{
          padding: '10px 14px',
          background: bg,
          border: `1px solid ${color}`,
          borderRadius: 8,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600 }}>{name}</div>
          {type && <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>{type} · {id}</div>}
        </div>
        <span style={{
          padding: '2px 10px',
          borderRadius: 4,
          background: `${color}22`,
          color,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
        }}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={confirm}
        okText={`确认${next === 'open' ? '打开' : '关闭'}`}
        cancelText="取消"
        title={<span style={{ color: '#e8f4ff' }}>阀门控制确认</span>}
        okButtonProps={{ style: { background: next === 'open' ? '#00ff88' : '#ff4757', borderColor: 'transparent', color: '#080c18', fontWeight: 700 } }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
      >
        <div style={{ color: '#e8f4ff' }}>
          将 <strong style={{ color: '#00d4ff' }}>{name}</strong> ({id}) 由 <span style={{ color }}>{state.toUpperCase()}</span> 切换为 <strong style={{ color: next === 'open' ? '#00ff88' : '#ff4757' }}>{next.toUpperCase()}</strong>
        </div>
      </Modal>
    </>
  )
}
