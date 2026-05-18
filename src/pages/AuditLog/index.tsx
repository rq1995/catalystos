import React, { useState } from 'react';
import { Timeline, Table, Select, Button, DatePicker, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { auditLogs } from '../../mock/data';

const { RangePicker } = DatePicker;

type Log = typeof auditLogs[0];

const actionStyle: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  '参数修改':   { bg: 'rgba(255,184,0,0.12)',   color: '#ffb800', border: 'rgba(255,184,0,0.4)',   dot: '#ffb800' },
  'AI推荐确认': { bg: 'rgba(123,97,255,0.12)',  color: '#7b61ff', border: 'rgba(123,97,255,0.4)', dot: '#7b61ff' },
  '手动接管':   { bg: 'rgba(255,71,87,0.12)',   color: '#ff4757', border: 'rgba(255,71,87,0.4)',  dot: '#ff4757' },
  '工单生成':   { bg: 'rgba(0,212,255,0.12)',   color: '#00d4ff', border: 'rgba(0,212,255,0.4)', dot: '#00d4ff' },
  '安全联锁':   { bg: 'rgba(255,71,87,0.12)',   color: '#ff4757', border: 'rgba(255,71,87,0.4)', dot: '#ff4757' },
  '实验启动':   { bg: 'rgba(0,255,136,0.10)',   color: '#00ff88', border: 'rgba(0,255,136,0.4)', dot: '#00ff88' },
  '模型切换':   { bg: 'rgba(123,97,255,0.12)',  color: '#7b61ff', border: 'rgba(123,97,255,0.4)', dot: '#7b61ff' },
};

function ActionBadge({ action }: { action: string }) {
  const s = actionStyle[action] || { bg: 'rgba(255,255,255,0.08)', color: '#e8f4ff', border: 'rgba(255,255,255,0.2)', dot: '#6b8aad' };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: '1px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {action}
    </span>
  );
}

export default function AuditLog() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'table'>('timeline');
  const [filterUser, setFilterUser] = useState<string | undefined>(undefined);
  const [filterAction, setFilterAction] = useState<string | undefined>(undefined);

  const filtered = auditLogs.filter(log => {
    if (filterUser && log.user !== filterUser) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  const timelineItems = filtered.map(log => {
    const s = actionStyle[log.action] || { dot: '#6b8aad', bg: '', color: '', border: '' };
    return {
      dot: (
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: s.dot, boxShadow: `0 0 6px ${s.dot}`,
        }} />
      ),
      children: (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <ActionBadge action={log.action} />
            <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{log.time}</span>
            <span style={{ marginLeft: 'auto', color: '#3d5168', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              IP: {log.ip}
            </span>
          </div>
          <div style={{ color: '#e8f4ff', fontSize: 13, marginBottom: 8 }}>{log.detail}</div>
          {(log.before !== null || log.after !== null) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {log.before !== null && (
                <span style={{
                  color: '#6b8aad', fontSize: 12, textDecoration: 'line-through',
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'rgba(255,71,87,0.08)', borderRadius: 4, padding: '1px 6px',
                }}>
                  {log.before}
                </span>
              )}
              {log.before !== null && log.after !== null && (
                <span style={{ color: '#6b8aad', fontSize: 14 }}>→</span>
              )}
              {log.after !== null && (
                <span style={{
                  color: '#00d4ff', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                  background: 'rgba(0,212,255,0.08)', borderRadius: 4, padding: '1px 6px',
                }}>
                  {log.after}
                </span>
              )}
            </div>
          )}
          <div style={{ color: '#6b8aad', fontSize: 12 }}>
            {log.user}
            <span style={{
              marginLeft: 6, background: 'rgba(255,255,255,0.06)',
              borderRadius: 4, padding: '1px 6px', fontSize: 11,
            }}>
              {log.role}
            </span>
          </div>
        </div>
      ),
    };
  });

  const tableColumns = [
    {
      title: '时间', dataIndex: 'time', key: 'time', width: 160,
      render: (v: string) => <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6b8aad', fontSize: 12 }}>{v}</span>,
    },
    { title: '操作人', dataIndex: 'user', key: 'user', render: (v: string) => <span style={{ color: '#e8f4ff' }}>{v}</span> },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <span style={{ color: '#6b8aad', fontSize: 12 }}>{v}</span> },
    { title: '操作类型', dataIndex: 'action', key: 'action', render: (v: string) => <ActionBadge action={v} /> },
    { title: '操作详情', dataIndex: 'detail', key: 'detail', render: (v: string) => <span style={{ color: '#e8f4ff', fontSize: 13 }}>{v}</span> },
    {
      title: '修改前', dataIndex: 'before', key: 'before',
      render: (v: string | null) => v
        ? <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textDecoration: 'line-through' }}>{v}</span>
        : <span style={{ color: '#3d5168' }}>—</span>,
    },
    {
      title: '修改后', dataIndex: 'after', key: 'after',
      render: (v: string | null) => v
        ? <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span>
        : <span style={{ color: '#3d5168' }}>—</span>,
    },
    {
      title: 'IP', dataIndex: 'ip', key: 'ip',
      render: (v: string) => <span style={{ color: '#3d5168', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{v}</span>,
    },
  ];

  const users = [...new Set(auditLogs.map(l => l.user))];
  const actions = [...new Set(auditLogs.map(l => l.action))];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#080c18' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <RangePicker
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}
        />
        <Select
          placeholder="操作人"
          value={filterUser}
          onChange={v => setFilterUser(v)}
          allowClear
          style={{ width: 130 }}
          options={users.map(u => ({ value: u, label: u }))}
        />
        <Select
          placeholder="操作类型"
          value={filterAction}
          onChange={v => setFilterAction(v)}
          allowClear
          style={{ width: 140 }}
          options={actions.map(a => ({ value: a, label: a }))}
        />
        <Button
          type="primary"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#0096ff)', border: 'none', borderRadius: 8, color: '#080c18', fontWeight: 600 }}
        >
          查询
        </Button>
        <Button
          onClick={() => { setFilterUser(undefined); setFilterAction(undefined); }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#6b8aad' }}
        >
          重置
        </Button>
        <Button
          icon={<DownloadOutlined />}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid rgba(0,212,255,0.4)',
            borderRadius: 8,
            color: '#00d4ff',
          }}
        >
          导出 CSV
        </Button>
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['timeline', 'table'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: activeTab === tab ? '#00d4ff' : '#6b8aad',
              border: activeTab === tab ? '1px solid rgba(0,212,255,0.35)' : '1px solid transparent',
              borderRadius: 7,
              padding: '6px 20px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {tab === 'timeline' ? '时间线视图' : '表格视图'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'timeline' ? (
        <div style={{ paddingTop: 8 }}>
          <Timeline items={timelineItems} />
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <Table
            dataSource={filtered}
            columns={tableColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            style={{ background: 'transparent' }}
            scroll={{ x: 1000 }}
          />
        </div>
      )}
    </div>
  );
}
