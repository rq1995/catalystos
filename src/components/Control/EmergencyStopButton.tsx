import { useState, useSyncExternalStore } from 'react'
import { Modal, message } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { isEstopActive, triggerEstop, releaseEstop, subscribe } from './controlBus'

export default function EmergencyStopButton({ size = 'normal' }: { size?: 'normal' | 'large' }) {
  const active = useSyncExternalStore(subscribe, isEstopActive, isEstopActive)
  const [open, setOpen] = useState(false)

  const confirm = () => {
    if (active) {
      releaseEstop('张研究员')
      message.success('已解除联锁')
    } else {
      triggerEstop('张研究员')
      message.error('紧急停车已触发，全系统进入联锁状态', 4)
    }
    setOpen(false)
  }

  const isLarge = size === 'large'
  const dim = isLarge ? 96 : 64

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          width: dim, height: dim, borderRadius: '50%',
          background: active
            ? 'radial-gradient(circle at 30% 30%, #ff7878, #b71d2c)'
            : 'radial-gradient(circle at 30% 30%, #ff4757, #8b0e1c)',
          border: '4px solid #2a0608',
          boxShadow: active
            ? '0 0 24px rgba(255,71,87,0.8), inset 0 -4px 8px rgba(0,0,0,0.4)'
            : '0 0 12px rgba(255,71,87,0.4), inset 0 -4px 8px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          letterSpacing: 2,
          fontSize: isLarge ? 14 : 11,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          animation: active ? 'pulseEstop 1s ease-in-out infinite' : 'none',
        }}
      >
        <ExclamationCircleFilled style={{ fontSize: isLarge ? 22 : 16, marginBottom: 2 }} />
        E-STOP
      </div>
      <style>{`
        @keyframes pulseEstop {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={confirm}
        okText={active ? '确认解除' : '确认触发 E-STOP'}
        cancelText="取消"
        title={<span style={{ color: '#ff4757', fontWeight: 700 }}>{active ? '解除紧急停车联锁' : '紧急停车确认'}</span>}
        okButtonProps={{
          danger: true,
          style: { background: '#ff4757', borderColor: '#ff4757', color: '#fff', fontWeight: 700 }
        }}
        styles={{ content: { background: '#0d1525', border: '1px solid rgba(255,71,87,0.4)' }, header: { background: '#0d1525' } }}
      >
        {active ? (
          <div style={{ color: '#e8f4ff' }}>
            当前处于联锁状态。解除后操作员需现场确认设备已恢复至安全初始位姿。
          </div>
        ) : (
          <div style={{ color: '#e8f4ff' }}>
            <div style={{ marginBottom: 10 }}>触发后将立即执行：</div>
            <ul style={{ paddingLeft: 18, color: '#ffb800', lineHeight: 1.8, margin: 0 }}>
              <li>所有 MFC 流量设定值归零，关闭进气阀</li>
              <li>所有泄压阀打开至 30% 受控泄压</li>
              <li>所有搅拌器停机，加热停止，启用冷却</li>
              <li>所有机械臂、AGV、注射泵停止当前任务</li>
            </ul>
          </div>
        )}
      </Modal>
    </>
  )
}
