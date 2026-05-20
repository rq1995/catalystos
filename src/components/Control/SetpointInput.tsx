import { useState } from 'react'
import { Modal, InputNumber, Button, message } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { pushControlLog } from './controlBus'

interface Props {
  device: string
  label: string
  unit: string
  value: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onCommit: (next: number) => void
  warning?: string
}

export default function SetpointInput({
  device, label, unit, value, min, max, step = 0.1, disabled, onCommit, warning
}: Props) {
  const [draft, setDraft] = useState<number>(value)
  const [open, setOpen] = useState(false)

  const dirty = draft !== value

  const confirm = () => {
    pushControlLog({
      user: '张研究员',
      device,
      action: `设定${label}`,
      before: value,
      after: draft,
    })
    onCommit(draft)
    message.success(`指令已下发到 ${device}`)
    setOpen(false)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#6b8aad', fontSize: 11, minWidth: 60 }}>{label}</span>
        <InputNumber
          value={draft}
          onChange={v => setDraft(v ?? 0)}
          min={min}
          max={max}
          step={step}
          size="small"
          disabled={disabled}
          style={{ width: 96, background: 'rgba(255,255,255,0.06)' }}
          addonAfter={<span style={{ color: '#6b8aad', fontSize: 10 }}>{unit}</span>}
        />
        <Button
          size="small"
          type="primary"
          ghost
          disabled={!dirty || disabled}
          onClick={() => setOpen(true)}
          style={{
            borderColor: dirty ? '#00d4ff' : 'rgba(255,255,255,0.15)',
            color: dirty ? '#00d4ff' : '#3d5168',
            fontSize: 11,
          }}
        >
          下发
        </Button>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={confirm}
        okText="确认下发"
        cancelText="取消"
        title={<span style={{ color: '#e8f4ff' }}>确认下发参数</span>}
        okButtonProps={{ style: { background: '#00ff88', borderColor: '#00ff88', color: '#080c18', fontWeight: 700 } }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#0d1525' } }}
      >
        <div style={{ color: '#e8f4ff', marginBottom: 12 }}>
          目标设备：<strong style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace' }}>{device}</strong>
        </div>
        <div style={{ color: '#e8f4ff', marginBottom: 12 }}>
          {label}：
          <span style={{ color: '#6b8aad', marginLeft: 6 }}>{value} {unit}</span>
          <span style={{ color: '#3d5168', margin: '0 8px' }}>→</span>
          <strong style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace' }}>{draft} {unit}</strong>
        </div>
        <div style={{ color: '#ffb800', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}>
          <ThunderboltOutlined /> {warning ?? '指令将立即下发到实体设备，请确认参数正确。'}
        </div>
      </Modal>
    </>
  )
}
