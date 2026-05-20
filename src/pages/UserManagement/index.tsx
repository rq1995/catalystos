import { useState } from 'react'
import { Tag, Switch, message } from 'antd'
import {
  UserAddOutlined, SearchOutlined, EditOutlined, StopOutlined,
  CheckCircleOutlined, TeamOutlined, SafetyOutlined, ClockCircleOutlined,
  CloseOutlined, SaveOutlined,
} from '@ant-design/icons'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e8f4ff',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
}

type Role = 'admin' | 'scientist' | 'engineer' | 'viewer'

interface UserRecord {
  id: string
  name: string
  avatar: string
  email: string
  phone: string
  role: Role
  department: string
  status: 'active' | 'inactive' | 'locked'
  lastLogin: string
  joined: string
  experiments: number
}

const roleConfig: Record<Role, { label: string; color: string; tagColor: string }> = {
  admin:     { label: '系统管理员',   color: '#ff4757', tagColor: 'red'     },
  scientist: { label: '实验科学家',   color: '#00d4ff', tagColor: 'cyan'    },
  engineer:  { label: '设备工程师',   color: '#ffb800', tagColor: 'orange'  },
  viewer:    { label: '只读访客',     color: '#6b8aad', tagColor: 'default' },
}

const allPermissions: Record<Role, string[]> = {
  admin:     ['dashboard', 'control', 'lab', 'ai', 'analysis', 'knowledge', 'materials', 'reports', 'system', 'users'],
  scientist: ['dashboard', 'lab', 'ai', 'analysis', 'knowledge', 'materials', 'reports'],
  engineer:  ['dashboard', 'control', 'analysis', 'system'],
  viewer:    ['dashboard', 'analysis'],
}

const permLabels: Record<string, string> = {
  dashboard:  '首页大屏',
  control:    '实时控制中心',
  lab:        '实验中台',
  ai:         'AI 智能中心',
  analysis:   '数据分析',
  knowledge:  '知识库',
  materials:  '物料管理',
  reports:    '报告 & 审计',
  system:     '系统管理',
  users:      '账号管理',
}

const mockUsers: UserRecord[] = [
  { id: 'USR-001', name: '张研究员', avatar: '张', email: 'zhang.wei@catalystos.ai',    phone: '+86 138-0000-8848', role: 'scientist', department: '催化材料研究室', status: 'active',   lastLogin: '2026-05-19 09:12', joined: '2023-03-15', experiments: 312 },
  { id: 'USR-002', name: '李管理员', avatar: '李', email: 'li.admin@catalystos.ai',     phone: '+86 139-1111-0001', role: 'admin',     department: '平台运维组',     status: 'active',   lastLogin: '2026-05-19 08:55', joined: '2022-08-01', experiments: 0   },
  { id: 'USR-003', name: '王工程师', avatar: '王', email: 'wang.eng@catalystos.ai',     phone: '+86 137-2222-0003', role: 'engineer',  department: '设备维护组',     status: 'active',   lastLogin: '2026-05-18 17:30', joined: '2023-06-20', experiments: 8   },
  { id: 'USR-004', name: '陈科学家', avatar: '陈', email: 'chen.sci@catalystos.ai',     phone: '+86 136-3333-0004', role: 'scientist', department: '催化材料研究室', status: 'active',   lastLogin: '2026-05-19 10:01', joined: '2024-01-10', experiments: 178 },
  { id: 'USR-005', name: '刘研究员', avatar: '刘', email: 'liu.research@catalystos.ai', phone: '+86 135-4444-0005', role: 'scientist', department: '聚合工艺研究室', status: 'inactive', lastLogin: '2026-04-30 14:22', joined: '2023-09-05', experiments: 245 },
  { id: 'USR-006', name: '赵访客',   avatar: '赵', email: 'zhao.view@partner.com',      phone: '+86 134-5555-0006', role: 'viewer',    department: '外部合作方',     status: 'active',   lastLogin: '2026-05-15 09:00', joined: '2026-03-01', experiments: 0   },
  { id: 'USR-007', name: '孙工程师', avatar: '孙', email: 'sun.eng@catalystos.ai',      phone: '+86 133-6666-0007', role: 'engineer',  department: '设备维护组',     status: 'locked',   lastLogin: '2026-05-01 11:15', joined: '2023-11-20', experiments: 12  },
  { id: 'USR-008', name: '周科学家', avatar: '周', email: 'zhou.sci@catalystos.ai',     phone: '+86 132-7777-0008', role: 'scientist', department: '聚合工艺研究室', status: 'active',   lastLogin: '2026-05-19 11:30', joined: '2024-05-15', experiments: 89  },
]

const statusConfig = {
  active:   { label: '正常',   color: '#00ff88', tagColor: 'green'   },
  inactive: { label: '停用',   color: '#6b8aad', tagColor: 'default' },
  locked:   { label: '已锁定', color: '#ff4757', tagColor: 'red'     },
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'scientist' as Role, department: '' })

  const filtered = users.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search) || u.department.includes(search)
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    admin:    users.filter(u => u.role === 'admin').length,
    scientist:users.filter(u => u.role === 'scientist').length,
    engineer: users.filter(u => u.role === 'engineer').length,
    viewer:   users.filter(u => u.role === 'viewer').length,
  }

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = u.status === 'active' ? 'inactive' : 'active'
      message.success(`用户 ${u.name} 已${next === 'active' ? '启用' : '停用'}`)
      return { ...u, status: next }
    }))
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) { message.error('请填写姓名和邮箱'); return }
    const id = `USR-00${users.length + 1}`
    setUsers(prev => [...prev, {
      id, avatar: newUser.name[0], phone: '--',
      status: 'active', lastLogin: '--', joined: new Date().toISOString().slice(0, 10),
      experiments: 0, ...newUser,
    }])
    setShowAddModal(false)
    setNewUser({ name: '', email: '', role: 'scientist', department: '' })
    message.success(`用户 ${newUser.name} 已创建，初始密码已发送至邮箱`)
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px 24px',
      background: '#080c18', fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: '总用户数',   val: stats.total,     color: '#00d4ff', icon: <TeamOutlined /> },
            { label: '活跃用户',   val: stats.active,    color: '#00ff88', icon: <CheckCircleOutlined /> },
            { label: '系统管理员', val: stats.admin,     color: '#ff4757', icon: <SafetyOutlined /> },
            { label: '实验科学家', val: stats.scientist, color: '#00d4ff', icon: <TeamOutlined /> },
            { label: '设备工程师', val: stats.engineer,  color: '#ffb800', icon: <TeamOutlined /> },
            { label: '只读访客',   val: stats.viewer,    color: '#6b8aad', icon: <ClockCircleOutlined /> },
          ].map(s => (
            <div key={s.label} style={{ ...glass, padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b8aad', fontSize: 11 }}>
                <span style={{ color: s.color }}>{s.icon}</span>{s.label}
              </div>
              <div style={{ color: s.color, fontSize: 26, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3d5168', fontSize: 14 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索姓名、邮箱、部门…"
              style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
            />
          </div>
          {/* Role filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'admin', 'scientist', 'engineer', 'viewer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  ...inputStyle,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  color: roleFilter === r ? '#00d4ff' : '#6b8aad',
                  borderColor: roleFilter === r ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.12)',
                  background: roleFilter === r ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.06)',
                  fontSize: 12,
                }}
              >
                {r === 'all' ? '全部' : roleConfig[r].label}
              </button>
            ))}
          </div>
          {/* Add user */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{ ...inputStyle, padding: '8px 18px', cursor: 'pointer', color: '#00ff88', borderColor: 'rgba(0,255,136,0.4)', background: 'rgba(0,255,136,0.08)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
          >
            <UserAddOutlined /> 新增用户
          </button>
        </div>

        {/* ── Add User Modal ── */}
        {showAddModal && (
          <div style={{ ...glass, padding: '20px 24px', borderColor: 'rgba(0,255,136,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700 }}>新增用户</span>
              <CloseOutlined onClick={() => setShowAddModal(false)} style={{ color: '#6b8aad', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: '姓名 *',   key: 'name',       placeholder: '真实姓名' },
                { label: '邮箱 *',   key: 'email',      placeholder: '工作邮箱（用于登录和通知）' },
                { label: '所属部门', key: 'department', placeholder: '如：催化材料研究室' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    value={(newUser as any)[f.key]}
                    onChange={e => setNewUser(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>角色权限 *</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as Role }))}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  {(Object.keys(roleConfig) as Role[]).map(r => (
                    <option key={r} value={r}>{roleConfig[r].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', fontSize: 12, color: '#6b8aad' }}>
              系统将自动生成随机初始密码并发送至用户邮箱，用户首次登录后需强制修改密码。
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowAddModal(false)} style={{ ...inputStyle, padding: '8px 20px', cursor: 'pointer', color: '#6b8aad' }}>取消</button>
              <button onClick={handleAddUser} style={{ ...inputStyle, padding: '8px 24px', cursor: 'pointer', color: '#00ff88', borderColor: 'rgba(0,255,136,0.4)', background: 'rgba(0,255,136,0.1)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <SaveOutlined /> 创建用户
              </button>
            </div>
          </div>
        )}

        {/* ── User Table ── */}
        <div style={{ ...glass, padding: '0 0 4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['用户', '角色', '部门', '实验批次', '最近登录', '状态', '操作'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 16px', color: '#6b8aad', fontWeight: 500, fontSize: 11, background: 'rgba(0,212,255,0.04)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* User cell */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${roleConfig[u.role].color}88, ${roleConfig[u.role].color}44)`,
                        border: `1px solid ${roleConfig[u.role].color}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#e8f4ff',
                      }}>{u.avatar}</div>
                      <div>
                        <div style={{ color: '#e8f4ff', fontWeight: 500 }}>{u.name}</div>
                        <div style={{ color: '#6b8aad', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Tag color={roleConfig[u.role].tagColor} style={{ fontSize: 11 }}>{roleConfig[u.role].label}</Tag>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b8aad', fontSize: 12 }}>{u.department}</td>
                  <td style={{ padding: '12px 16px', color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{u.experiments}</td>
                  <td style={{ padding: '12px 16px', color: '#6b8aad', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{u.lastLogin}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig[u.status].color }} />
                      <Tag color={statusConfig[u.status].tagColor} style={{ fontSize: 10, margin: 0 }}>{statusConfig[u.status].label}</Tag>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span
                        onClick={() => setEditingUser(u)}
                        style={{ color: '#00d4ff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <EditOutlined /> 编辑
                      </span>
                      {u.role !== 'admin' && (
                        <span
                          onClick={() => toggleStatus(u.id)}
                          style={{ color: u.status === 'active' ? '#ffb800' : '#00ff88', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <StopOutlined /> {u.status === 'active' ? '停用' : '启用'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#3d5168' }}>暂无匹配用户</div>
          )}
        </div>

        {/* ── Edit User Drawer ── */}
        {editingUser && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
          }} onClick={() => setEditingUser(null)}>
            <div
              style={{
                width: 480, height: '100%', overflowY: 'auto',
                background: '#0d1225', borderLeft: '1px solid rgba(255,255,255,0.1)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: 20,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#e8f4ff', fontSize: 16, fontWeight: 700 }}>编辑用户</span>
                <CloseOutlined onClick={() => setEditingUser(null)} style={{ color: '#6b8aad', cursor: 'pointer', fontSize: 16 }} />
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleConfig[editingUser.role].color}88, ${roleConfig[editingUser.role].color}44)`,
                  border: `1px solid ${roleConfig[editingUser.role].color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#e8f4ff',
                }}>{editingUser.avatar}</div>
                <div>
                  <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700 }}>{editingUser.name}</div>
                  <div style={{ color: '#6b8aad', fontSize: 12, marginTop: 2 }}>{editingUser.id}</div>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: '姓名',     key: 'name',       type: 'text'  },
                  { label: '邮箱',     key: 'email',      type: 'email' },
                  { label: '手机号',   key: 'phone',      type: 'text'  },
                  { label: '所属部门', key: 'department', type: 'text'  },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={(editingUser as any)[f.key]}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                ))}

                {/* Role */}
                <div>
                  <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>角色权限</label>
                  <select
                    defaultValue={editingUser.role}
                    onChange={e => setEditingUser(prev => prev ? { ...prev, role: e.target.value as Role } : null)}
                    style={{ ...inputStyle, width: '100%' }}
                  >
                    {(Object.keys(roleConfig) as Role[]).map(r => (
                      <option key={r} value={r}>{roleConfig[r].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions preview */}
              <div>
                <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 10 }}>当前角色可访问模块</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.keys(permLabels).map(perm => {
                    const hasAccess = allPermissions[editingUser.role].includes(perm)
                    return (
                      <span key={perm} style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 11,
                        background: hasAccess ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${hasAccess ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: hasAccess ? '#00d4ff' : '#3d5168',
                      }}>{permLabels[perm]}</span>
                    )
                  })}
                </div>
              </div>

              {/* Status toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                <div>
                  <div style={{ color: '#e8f4ff', fontSize: 13 }}>账号状态</div>
                  <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 2 }}>停用后用户无法登录</div>
                </div>
                <Switch
                  checked={editingUser.status === 'active'}
                  onChange={v => setEditingUser(prev => prev ? { ...prev, status: v ? 'active' : 'inactive' } : null)}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  onClick={() => { setEditingUser(null); message.success('用户信息已保存') }}
                  style={{ ...inputStyle, flex: 1, padding: '10px', cursor: 'pointer', color: '#00d4ff', borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.08)', fontWeight: 600, textAlign: 'center' }}
                >
                  保存修改
                </button>
                <button
                  onClick={() => { message.success('重置密码邮件已发送'); }}
                  style={{ ...inputStyle, flex: 1, padding: '10px', cursor: 'pointer', color: '#ffb800', borderColor: 'rgba(255,184,0,0.3)', background: 'rgba(255,184,0,0.06)', textAlign: 'center' }}
                >
                  重置密码
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
