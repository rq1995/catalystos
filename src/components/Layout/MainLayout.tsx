import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Badge, Tooltip } from 'antd'
import {
  HomeOutlined, ExperimentOutlined, RobotOutlined, ControlOutlined,
  BarChartOutlined, DatabaseOutlined, ShoppingOutlined, FileTextOutlined,
  SettingOutlined, BellOutlined, UserOutlined, BranchesOutlined,
  ThunderboltOutlined, LineChartOutlined, ApartmentOutlined, CarOutlined,
  AlertOutlined, FundOutlined, NodeIndexOutlined, AppstoreOutlined,
  BookOutlined, InboxOutlined, AuditOutlined, WifiOutlined
} from '@ant-design/icons'

const menuGroups = [
  {
    label: null,
    items: [{ key: '/dashboard', icon: <HomeOutlined />, label: '首页大屏' }]
  },
  {
    label: '实验中台',
    items: [
      { key: '/lab/process', icon: <LineChartOutlined />, label: '反应过程监控' },
      { key: '/lab/orchestration', icon: <BranchesOutlined />, label: '流程编排' },
      { key: '/lab/workorders', icon: <AppstoreOutlined />, label: '工单看板' },
      { key: '/lab/scheduling', icon: <ThunderboltOutlined />, label: '智能排产' },
    ]
  },
  {
    label: 'AI 智能中心',
    items: [
      { key: '/ai/recommend', icon: <RobotOutlined />, label: '实验方案推荐' },
      { key: '/ai/models', icon: <FundOutlined />, label: '模型管理' },
      { key: '/ai/learning', icon: <NodeIndexOutlined />, label: '主动学习看板' },
    ]
  },
  {
    label: '设备管理',
    items: [
      { key: '/devices/topology', icon: <ApartmentOutlined />, label: '设备拓扑' },
      { key: '/devices/agv', icon: <CarOutlined />, label: 'AGV 控制' },
      { key: '/devices/alarms', icon: <AlertOutlined />, label: '告警中心' },
    ]
  },
  {
    label: '数据分析',
    items: [
      { key: '/analysis/spectrum', icon: <BarChartOutlined />, label: '谱图分析' },
      { key: '/analysis/screen', icon: <ControlOutlined />, label: '数据大屏' },
      { key: '/analysis/structure', icon: <FundOutlined />, label: '结构-性能图谱' },
    ]
  },
  {
    label: '知识库',
    items: [
      { key: '/knowledge/catalysts', icon: <ExperimentOutlined />, label: '催化剂数据库' },
      { key: '/knowledge/chemdb', icon: <DatabaseOutlined />, label: '物化数据库' },
      { key: '/knowledge/sop', icon: <BookOutlined />, label: '实验方法库' },
    ]
  },
  {
    label: '物料管理',
    items: [
      { key: '/materials/inventory', icon: <InboxOutlined />, label: '库存总览' },
    ]
  },
  {
    label: '报告 & 审计',
    items: [
      { key: '/reports/list', icon: <FileTextOutlined />, label: '实验报告' },
      { key: '/reports/audit', icon: <AuditOutlined />, label: '操作审计日志' },
    ]
  },
  {
    label: '系统管理',
    items: [
      { key: '/system/datacollect', icon: <WifiOutlined />, label: '数据采集监控' },
    ]
  },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [time, setTime] = useState(new Date())
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const currentPath = location.pathname

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080c18' }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? 56 : 220,
        flexShrink: 0,
        background: 'rgba(13,18,37,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }} onClick={() => setCollapsed(!collapsed)}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #00d4ff, #7b61ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 16px rgba(0,212,255,0.4)',
          }}>C</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8f4ff', letterSpacing: 1 }}>CatalystOS</div>
              <div style={{ fontSize: 10, color: '#6b8aad', marginTop: 1 }}>AI 实验室平台</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && !collapsed && (
                <div style={{ padding: '10px 16px 4px', fontSize: 10, color: '#3d5168', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const active = currentPath === item.key || (item.key !== '/dashboard' && currentPath.startsWith(item.key))
                return (
                  <Tooltip key={item.key} title={collapsed ? item.label : ''} placement="right">
                    <div
                      onClick={() => navigate(item.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: collapsed ? '10px 14px' : '9px 16px',
                        cursor: 'pointer',
                        borderRadius: 6,
                        margin: '1px 6px',
                        background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                        borderLeft: active ? '2px solid #00d4ff' : '2px solid transparent',
                        color: active ? '#00d4ff' : '#6b8aad',
                        fontSize: 13,
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom user */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7b61ff,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>张</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#e8f4ff' }}>张研究员</div>
              <div style={{ fontSize: 10, color: '#3d5168' }}>实验科学家</div>
            </div>
            <SettingOutlined style={{ color: '#3d5168', fontSize: 13 }} />
          </div>
        )}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          height: 48, flexShrink: 0,
          background: 'rgba(13,18,37,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 20px', gap: 16,
        }}>
          {/* System status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
            <span style={{ fontSize: 12, color: '#6b8aad' }}>系统正常</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 12, color: '#6b8aad', fontFamily: 'JetBrains Mono' }}>
            {time.toLocaleDateString('zh-CN')} {time.toLocaleTimeString('zh-CN')}
          </span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
          <Badge count={2} size="small">
            <BellOutlined style={{ color: '#6b8aad', fontSize: 16, cursor: 'pointer' }} />
          </Badge>
          <UserOutlined style={{ color: '#6b8aad', fontSize: 16, cursor: 'pointer' }} />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
