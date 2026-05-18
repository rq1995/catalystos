import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Table, Slider, InputNumber, Button, Tag } from 'antd'
import { WarningOutlined, ExclamationCircleOutlined, InfoCircleOutlined, SaveOutlined } from '@ant-design/icons'
import { alarms } from '../../mock/data'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

function getPieOption() {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(8,12,24,0.9)', borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' } },
    legend: { bottom: 0, textStyle: { color: '#6b8aad', fontSize: 9 }, itemWidth: 10, itemHeight: 6 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      label: { show: false },
      data: [
        { name: '温度异常', value: 2, itemStyle: { color: '#ff4757' } },
        { name: '压力异常', value: 1, itemStyle: { color: '#ffb800' } },
        { name: '设备离线', value: 1, itemStyle: { color: '#7b61ff' } },
        { name: '其他', value: 1, itemStyle: { color: '#6b8aad' } },
      ],
    }],
  }
}

const levelConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  critical: { color: '#ff4757', label: '严重', icon: <ExclamationCircleOutlined /> },
  warning: { color: '#ffb800', label: '预警', icon: <WarningOutlined /> },
  info: { color: '#6b8aad', label: '提示', icon: <InfoCircleOutlined /> },
}

const statusConfig: Record<string, { color: string; label: string }> = {
  resolved: { color: '#00ff88', label: '已解决' },
  pending: { color: '#ff4757', label: '待处理' },
  acknowledged: { color: '#ffb800', label: '已知晓' },
}

export default function AlarmCenter() {
  const [tempLimit, setTempLimit] = useState(110)
  const [pressureLimit, setPressureLimit] = useState(1.2)
  const [slopeThreshold, setSlopeThreshold] = useState(5)
  const [offlineTimeout, setOfflineTimeout] = useState(3)

  const critical = alarms.filter(a => a.level === 'critical').length
  const warning = alarms.filter(a => a.level === 'warning').length
  const info = alarms.filter(a => a.level === 'info').length
  const handled = alarms.filter(a => a.handled).length
  const handleRate = Math.round((handled / alarms.length) * 100)

  const columns = [
    {
      title: '等级', dataIndex: 'level', width: 64,
      render: (v: string) => {
        const cfg = levelConfig[v] ?? levelConfig.info
        return <span style={{ color: cfg.color, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>{cfg.icon} {cfg.label}</span>
      },
    },
    { title: '设备', dataIndex: 'device', width: 80, render: (v: string) => <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v}</span> },
    { title: '告警内容', dataIndex: 'message', render: (v: string) => <span style={{ color: '#e8f4ff', fontSize: 12 }}>{v}</span> },
    { title: '触发时间', dataIndex: 'time', width: 90, render: (v: string) => <span style={{ color: '#6b8aad', fontSize: 11 }}>{v}</span> },
    { title: '处置动作', dataIndex: 'action', render: (v: string) => <span style={{ color: '#6b8aad', fontSize: 11 }}>{v}</span> },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: string) => {
        const cfg = statusConfig[v] ?? statusConfig.pending
        return <Tag color={v === 'resolved' ? 'success' : v === 'pending' ? 'error' : 'warning'} style={{ fontSize: 10 }}>{cfg.label}</Tag>
      },
    },
    {
      title: '处置人', dataIndex: 'handled', width: 80,
      render: (v: boolean) => <span style={{ color: v ? '#00ff88' : '#ff4757', fontSize: 12 }}>{v ? '已处置' : '未处置'}</span>,
    },
    {
      title: '操作', width: 80,
      render: (_: any, record: any) => (
        <Button size="small" type="link" style={{ color: '#00d4ff', padding: 0, fontSize: 11 }}
          disabled={record.status === 'resolved'}>
          {record.status === 'resolved' ? '已完成' : '处理'}
        </Button>
      ),
    },
  ]

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 顶部统计 */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        {[
          { label: '严重', count: critical, color: '#ff4757', icon: <ExclamationCircleOutlined /> },
          { label: '预警', count: warning, color: '#ffb800', icon: <WarningOutlined /> },
          { label: '提示', count: info, color: '#6b8aad', icon: <InfoCircleOutlined /> },
        ].map(item => (
          <div key={item.label} style={{ ...glass, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
            <div>
              <div style={{ color: item.color, fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{item.count}</div>
              <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 2 }}>{item.label}告警</div>
            </div>
          </div>
        ))}
        <div style={{ ...glass, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <div>
            <div style={{ color: '#6b8aad', fontSize: 11 }}>今日总告警</div>
            <div style={{ color: '#e8f4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700 }}>{alarms.length}</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ color: '#6b8aad', fontSize: 11 }}>已处置率</div>
            <div style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700 }}>{handleRate}%</div>
          </div>
        </div>
      </div>

      {/* 主区域 */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        {/* 告警列表 */}
        <div style={{ flex: 1, minWidth: 0, ...glass, padding: '14px 16px', overflow: 'auto' }}>
          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>告警列表</div>
          <Table
            dataSource={alarms}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ background: 'transparent' }}
            rowClassName={(record) => record.level === 'critical' ? 'critical-row' : ''}
          />
        </div>

        {/* 右侧边栏 */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 告警规则配置 */}
          <div style={{ ...glass, padding: '14px 16px' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>告警规则配置</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b8aad', fontSize: 11 }}>温度上限</span>
                <span style={{ color: '#ffb800', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{tempLimit}°C</span>
              </div>
              <Slider min={80} max={120} value={tempLimit} onChange={setTempLimit}
                trackStyle={{ background: '#ffb800' }} handleStyle={{ borderColor: '#ffb800' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b8aad', fontSize: 11 }}>压力上限</span>
                <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{pressureLimit} MPa</span>
              </div>
              <Slider min={0.5} max={1.5} step={0.1} value={pressureLimit} onChange={setPressureLimit}
                trackStyle={{ background: '#00d4ff' }} handleStyle={{ borderColor: '#00d4ff' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 6 }}>飞温斜率阈值 (°C/min)</div>
              <InputNumber
                value={slopeThreshold} onChange={v => setSlopeThreshold(v ?? 5)}
                size="small" style={{ width: '100%' }} min={1} max={20}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 6 }}>设备离线超时 (min)</div>
              <InputNumber
                value={offlineTimeout} onChange={v => setOfflineTimeout(v ?? 3)}
                size="small" style={{ width: '100%' }} min={1} max={30}
              />
            </div>
            <Button type="primary" ghost block size="small" icon={<SaveOutlined />}>保存规则</Button>
          </div>

          {/* 告警分布饼图 */}
          <div style={{ ...glass, padding: '14px 16px', flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#e8f4ff', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>告警类型分布</div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ReactECharts option={getPieOption()} style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
