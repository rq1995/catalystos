import { useState } from 'react'
import { Tag, Switch, message } from 'antd'
import {
  UserOutlined, LockOutlined, BellOutlined, HistoryOutlined,
  EditOutlined, CheckOutlined, CloseOutlined, KeyOutlined,
  SafetyOutlined, GlobalOutlined, MailOutlined, PhoneOutlined,
  TeamOutlined, CalendarOutlined, ExperimentOutlined, FileTextOutlined,
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
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
}

// Mock user data
const currentUser = {
  name: '张研究员',
  nameEn: 'Zhang Wei',
  role: '实验科学家',
  roleKey: 'scientist',
  department: '催化材料研究室',
  email: 'zhang.wei@catalystos.ai',
  phone: '+86 138-0000-8848',
  joined: '2023-03-15',
  lastLogin: '2026-05-19 09:12:44',
  avatar: '张',
  bio: '专注茂金属催化剂合成与性能调控，主导 rac-Et(Ind)₂ZrCl₂ 体系优化项目。',
  stats: {
    experiments: 312,
    reports: 47,
    catalysts: 28,
    daysActive: 418,
  },
}

const loginHistory = [
  { id: 1, time: '2026-05-19 09:12:44', ip: '192.168.1.42',  device: 'Chrome 124 · macOS',  location: '上海',  status: 'success' },
  { id: 2, time: '2026-05-18 16:30:21', ip: '192.168.1.42',  device: 'Chrome 124 · macOS',  location: '上海',  status: 'success' },
  { id: 3, time: '2026-05-17 08:55:03', ip: '10.20.1.88',    device: 'Safari 17 · iPad',    location: '北京',  status: 'success' },
  { id: 4, time: '2026-05-16 22:11:08', ip: '210.14.52.100', device: 'Edge 122 · Windows',  location: '广州',  status: 'failed'  },
  { id: 5, time: '2026-05-15 09:01:55', ip: '192.168.1.42',  device: 'Chrome 124 · macOS',  location: '上海',  status: 'success' },
  { id: 6, time: '2026-05-14 14:22:40', ip: '192.168.1.42',  device: 'Chrome 124 · macOS',  location: '上海',  status: 'success' },
]

const notifications = [
  { key: 'alarm_l3',     label: 'L3 严重告警',           desc: '设备联锁触发时立即通知',  email: true,  sms: true,  inapp: true  },
  { key: 'alarm_l2',     label: 'L2 预警通知',           desc: '参数超出软限位时通知',     email: true,  sms: false, inapp: true  },
  { key: 'ai_recommend', label: 'AI 推荐新方案',         desc: '贝叶斯优化产出新候选时',  email: false, sms: false, inapp: true  },
  { key: 'report_done',  label: '实验报告生成完成',       desc: '报告自动生成后通知',      email: true,  sms: false, inapp: true  },
  { key: 'model_update', label: '预测模型更新',           desc: '主动学习完成一轮迭代时',  email: false, sms: false, inapp: true  },
  { key: 'inventory',    label: '物料库存预警',           desc: '关注物料低于阈值时',      email: true,  sms: false, inapp: true  },
]

const apiTokens = [
  { id: 'tok_1', name: 'Jupyter Lab 访问', created: '2026-04-10', lastUsed: '2026-05-18', scope: '只读', active: true },
  { id: 'tok_2', name: 'CI/CD Pipeline', created: '2026-02-28', lastUsed: '2026-05-17', scope: '读写', active: true },
  { id: 'tok_3', name: '旧版 Python SDK', created: '2025-11-01', lastUsed: '2026-01-03', scope: '只读', active: false },
]

const tabs = [
  { key: 'info',     label: '基本信息',  icon: <UserOutlined /> },
  { key: 'security', label: '安全设置',  icon: <LockOutlined /> },
  { key: 'notify',   label: '通知偏好',  icon: <BellOutlined /> },
  { key: 'history',  label: '登录记录',  icon: <HistoryOutlined /> },
]

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('info')
  const [editingInfo, setEditingInfo] = useState(false)
  const [notif, setNotif] = useState(() =>
    Object.fromEntries(notifications.map(n => [n.key, { email: n.email, sms: n.sms, inapp: n.inapp }]))
  )
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')

  const handleSaveInfo = () => {
    setEditingInfo(false)
    message.success('个人信息已保存')
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px 24px',
      background: '#080c18', fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Top Profile Card ── */}
        <div style={{ ...glass, padding: '24px 28px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7b61ff, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 24px rgba(0,212,255,0.3)',
            }}>{currentUser.avatar}</div>
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: '#00ff88', border: '2px solid #080c18',
              boxShadow: '0 0 6px #00ff88',
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#e8f4ff' }}>{currentUser.name}</span>
              <span style={{ fontSize: 13, color: '#6b8aad' }}>{currentUser.nameEn}</span>
              <Tag color="cyan" style={{ fontSize: 11 }}>{currentUser.role}</Tag>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
              {[
                { icon: <TeamOutlined />,     text: currentUser.department },
                { icon: <MailOutlined />,     text: currentUser.email },
                { icon: <PhoneOutlined />,    text: currentUser.phone },
                { icon: <CalendarOutlined />, text: `加入于 ${currentUser.joined}` },
              ].map((item, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b8aad', fontSize: 12 }}>
                  <span style={{ color: '#3d5168' }}>{item.icon}</span>{item.text}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#6b8aad', lineHeight: 1.6, maxWidth: 600 }}>{currentUser.bio}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {[
              { icon: <ExperimentOutlined />, val: currentUser.stats.experiments, label: '实验批次', color: '#00d4ff' },
              { icon: <FileTextOutlined />,   val: currentUser.stats.reports,     label: '报告生成', color: '#7b61ff' },
              { icon: <ExperimentOutlined />, val: currentUser.stats.catalysts,   label: '催化剂',   color: '#00ff88' },
              { icon: <CalendarOutlined />,   val: currentUser.stats.daysActive,  label: '活跃天数', color: '#ffb800' },
            ].map((s, i) => (
              <div key={i} style={{
                ...glass, padding: '12px 16px', textAlign: 'center', minWidth: 80,
              }}>
                <div style={{ color: s.color, fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ color: s.color, fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
                <div style={{ color: '#6b8aad', fontSize: 10, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs + Content ── */}
        <div style={{ display: 'flex', gap: 20 }}>

          {/* Tab list */}
          <div style={{ ...glass, padding: '8px 0', width: 160, flexShrink: 0, alignSelf: 'flex-start' }}>
            {tabs.map(t => (
              <div
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                  color: activeTab === t.key ? '#00d4ff' : '#6b8aad',
                  background: activeTab === t.key ? 'rgba(0,212,255,0.08)' : 'transparent',
                  borderLeft: activeTab === t.key ? '2px solid #00d4ff' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (activeTab !== t.key) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {t.icon}<span>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── 基本信息 ── */}
            {activeTab === 'info' && (
              <div style={{ ...glass, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700 }}>基本信息</span>
                  {!editingInfo ? (
                    <button
                      onClick={() => setEditingInfo(true)}
                      style={{ ...inputStyle, width: 'auto', padding: '6px 16px', cursor: 'pointer', color: '#00d4ff', borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <EditOutlined /> 编辑
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleSaveInfo} style={{ ...inputStyle, width: 'auto', padding: '6px 16px', cursor: 'pointer', color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckOutlined /> 保存
                      </button>
                      <button onClick={() => setEditingInfo(false)} style={{ ...inputStyle, width: 'auto', padding: '6px 16px', cursor: 'pointer', color: '#6b8aad', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CloseOutlined /> 取消
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[
                    { label: '姓名',     defaultVal: currentUser.name,       icon: <UserOutlined /> },
                    { label: '英文名',   defaultVal: currentUser.nameEn,     icon: <GlobalOutlined /> },
                    { label: '所属部门', defaultVal: currentUser.department,  icon: <TeamOutlined /> },
                    { label: '职务角色', defaultVal: currentUser.role,        icon: <SafetyOutlined />, readonly: true },
                    { label: '邮箱',     defaultVal: currentUser.email,       icon: <MailOutlined /> },
                    { label: '手机号',   defaultVal: currentUser.phone,       icon: <PhoneOutlined /> },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ color: '#6b8aad', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ color: '#3d5168' }}>{f.icon}</span>{f.label}
                        {f.readonly && <Tag style={{ fontSize: 10, margin: 0 }}>系统锁定</Tag>}
                      </label>
                      <input
                        defaultValue={f.defaultVal}
                        readOnly={!editingInfo || f.readonly}
                        style={{
                          ...inputStyle,
                          opacity: (!editingInfo || f.readonly) ? 0.7 : 1,
                          cursor: (!editingInfo || f.readonly) ? 'default' : 'text',
                          borderColor: editingInfo && !f.readonly ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>个人简介</label>
                    <textarea
                      defaultValue={currentUser.bio}
                      readOnly={!editingInfo}
                      rows={3}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        opacity: !editingInfo ? 0.7 : 1,
                        cursor: !editingInfo ? 'default' : 'text',
                        borderColor: editingInfo ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 10 }}>账号信息</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: '用户 ID',   value: 'USR-20230315-001' },
                      { label: '注册日期',  value: currentUser.joined },
                      { label: '最近登录',  value: currentUser.lastLogin },
                    ].map(item => (
                      <div key={item.label} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                        <div style={{ color: '#6b8aad', fontSize: 11 }}>{item.label}</div>
                        <div style={{ color: '#e8f4ff', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 安全设置 ── */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Password */}
                <div style={{ ...glass, padding: '20px 24px' }}>
                  <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LockOutlined style={{ color: '#00d4ff' }} /> 修改密码
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
                    {['当前密码', '新密码', '确认新密码'].map(label => (
                      <div key={label}>
                        <label style={{ color: '#6b8aad', fontSize: 12, display: 'block', marginBottom: 6 }}>{label}</label>
                        <input type="password" placeholder="••••••••" style={inputStyle} />
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: '#3d5168', lineHeight: 1.6 }}>
                      密码要求：至少 10 位，包含大小写字母、数字及特殊字符（!@#$%^&*）
                    </div>
                    <button
                      onClick={() => message.success('密码修改成功')}
                      style={{ ...inputStyle, width: 'auto', padding: '8px 24px', cursor: 'pointer', color: '#00d4ff', borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.1)', fontWeight: 600 }}
                    >
                      更新密码
                    </button>
                  </div>
                </div>

                {/* 2FA */}
                <div style={{ ...glass, padding: '20px 24px' }}>
                  <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyOutlined style={{ color: '#00ff88' }} /> 两步验证（2FA）
                  </div>
                  <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 16 }}>启用后每次登录需额外验证 TOTP 动态码</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Authenticator App', desc: 'Google Authenticator / Authy 等 TOTP 应用', enabled: true },
                      { label: '短信验证码',         desc: '发送至 +86 138-****-8848',                  enabled: false },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.2)',
                      }}>
                        <div>
                          <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                          <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 2 }}>{item.desc}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.enabled && <Tag color="green" style={{ fontSize: 10 }}>已启用</Tag>}
                          <Switch defaultChecked={item.enabled} size="small" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Tokens */}
                <div style={{ ...glass, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <KeyOutlined style={{ color: '#7b61ff' }} /> API 访问令牌
                    </div>
                    <button
                      onClick={() => setShowTokenModal(true)}
                      style={{ ...inputStyle, width: 'auto', padding: '6px 16px', cursor: 'pointer', color: '#7b61ff', borderColor: 'rgba(123,97,255,0.4)', background: 'rgba(123,97,255,0.1)' }}
                    >
                      + 新建令牌
                    </button>
                  </div>
                  {showTokenModal && (
                    <div style={{ marginBottom: 16, padding: '14px 16px', borderRadius: 8, background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.2)' }}>
                      <div style={{ color: '#e8f4ff', fontSize: 13, marginBottom: 10 }}>新建 API 令牌</div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input value={newTokenName} onChange={e => setNewTokenName(e.target.value)} placeholder="令牌名称（如：Jupyter Lab）" style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={() => { setShowTokenModal(false); setNewTokenName(''); message.success('令牌已生成，请妥善保存') }} style={{ ...inputStyle, width: 'auto', padding: '8px 16px', cursor: 'pointer', color: '#7b61ff', borderColor: 'rgba(123,97,255,0.4)', background: 'rgba(123,97,255,0.1)' }}>生成</button>
                        <button onClick={() => setShowTokenModal(false)} style={{ ...inputStyle, width: 'auto', padding: '8px 16px', cursor: 'pointer', color: '#6b8aad' }}>取消</button>
                      </div>
                    </div>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['令牌名称', '权限范围', '创建日期', '最近使用', '状态', '操作'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#6b8aad', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {apiTokens.map(tok => (
                        <tr key={tok.id}>
                          <td style={{ padding: '10px', color: '#e8f4ff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7b61ff' }}>sk-••••{tok.id.slice(-4)}</span>
                            <br /><span style={{ fontSize: 11, color: '#6b8aad' }}>{tok.name}</span>
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <Tag color={tok.scope === '读写' ? 'orange' : 'cyan'} style={{ fontSize: 10 }}>{tok.scope}</Tag>
                          </td>
                          <td style={{ padding: '10px', color: '#6b8aad', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{tok.created}</td>
                          <td style={{ padding: '10px', color: '#6b8aad', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{tok.lastUsed}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <Tag color={tok.active ? 'green' : 'default'} style={{ fontSize: 10 }}>{tok.active ? '有效' : '已失效'}</Tag>
                          </td>
                          <td style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span onClick={() => message.warning('令牌已撤销')} style={{ color: '#ff4757', fontSize: 11, cursor: 'pointer' }}>撤销</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── 通知偏好 ── */}
            {activeTab === 'notify' && (
              <div style={{ ...glass, padding: '20px 24px' }}>
                <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>通知偏好设置</div>
                <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 20 }}>选择各类事件的通知方式，应用级通知始终开启</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['事件类型', '描述', '邮件', '短信', '站内'].map(h => (
                        <th key={h} style={{ textAlign: h === '事件类型' || h === '描述' ? 'left' : 'center', padding: '8px 12px', color: '#6b8aad', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map(n => (
                      <tr key={n.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', color: '#e8f4ff', fontWeight: 500 }}>{n.label}</td>
                        <td style={{ padding: '12px', color: '#6b8aad', fontSize: 12 }}>{n.desc}</td>
                        {(['email', 'sms', 'inapp'] as const).map(type => (
                          <td key={type} style={{ padding: '12px', textAlign: 'center' }}>
                            <Switch
                              size="small"
                              checked={notif[n.key]?.[type]}
                              disabled={type === 'inapp'}
                              onChange={v => setNotif(prev => ({ ...prev, [n.key]: { ...prev[n.key], [type]: v } }))}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => message.success('通知偏好已保存')}
                    style={{ ...inputStyle, width: 'auto', padding: '8px 24px', cursor: 'pointer', color: '#00d4ff', borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.1)', fontWeight: 600 }}
                  >
                    保存设置
                  </button>
                </div>
              </div>
            )}

            {/* ── 登录记录 ── */}
            {activeTab === 'history' && (
              <div style={{ ...glass, padding: '20px 24px' }}>
                <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>登录记录</div>
                <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 20 }}>最近 30 天的登录历史，发现异常登录请立即修改密码</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['登录时间', 'IP 地址', '设备信息', '地理位置', '状态'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b8aad', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map(log => (
                      <tr key={log.id} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: log.status === 'failed' ? 'rgba(255,71,87,0.04)' : 'transparent',
                      }}>
                        <td style={{ padding: '10px 12px', color: '#e8f4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                          {log.id === 1 && <span style={{ marginRight: 6, padding: '1px 6px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', borderRadius: 4, fontSize: 10 }}>当前</span>}
                          {log.time}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#7b61ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{log.ip}</td>
                        <td style={{ padding: '10px 12px', color: '#6b8aad' }}>{log.device}</td>
                        <td style={{ padding: '10px 12px', color: '#6b8aad' }}>{log.location}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {log.status === 'success'
                            ? <Tag color="green" style={{ fontSize: 10 }}>成功</Tag>
                            : <Tag color="red" style={{ fontSize: 10 }}>失败</Tag>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#ffb800', fontSize: 16 }}>⚠️</span>
                  <div>
                    <div style={{ color: '#ffb800', fontSize: 12, fontWeight: 600 }}>检测到 1 次登录失败</div>
                    <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 2 }}>来自广州 IP 210.14.52.100 的登录尝试失败。如非本人操作，建议立即修改密码并开启两步验证。</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
