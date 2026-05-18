import React from 'react';
import { Progress, Table, Tag } from 'antd';
import { inventory } from '../../mock/data';

const categoryColor: Record<string, { bg: string; color: string; border: string }> = {
  '助催化剂': { bg: 'rgba(123,97,255,0.15)', color: '#7b61ff', border: 'rgba(123,97,255,0.4)' },
  '单体': { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: 'rgba(0,212,255,0.35)' },
  '溶剂': { bg: 'rgba(0,100,255,0.12)', color: '#4da6ff', border: 'rgba(77,166,255,0.35)' },
  '催化剂原料': { bg: 'rgba(255,184,0,0.12)', color: '#ffb800', border: 'rgba(255,184,0,0.35)' },
};

const refillLogs = [
  { time: '2024-05-18 09:20', material: '甲基铝氧烷 (MAO)', amount: '0.5 L', operator: '李工程师' },
  { time: '2024-05-17 14:35', material: '丙烯 (聚合级)', amount: '10 kg', operator: '张研究员' },
  { time: '2024-05-16 11:00', material: '甲苯 (溶剂)', amount: '5 L', operator: '王科学家' },
  { time: '2024-05-15 16:45', material: '甲基铝氧烷 (MAO)', amount: '1.0 L', operator: '李工程师' },
  { time: '2024-05-14 10:30', material: '正己烷 (溶剂)', amount: '8 L', operator: '赵博士' },
];

export default function Inventory() {
  const totalKinds = inventory.length;
  const lowStockCount = inventory.filter(m => m.current / m.max < 0.2).length;
  const criticalCount = inventory.filter(m => m.current < m.safety).length;

  const statCards = [
    { label: '总物料种类', value: totalKinds, color: '#00d4ff' },
    { label: '低库存预警', value: lowStockCount, color: '#ffb800' },
    { label: '告急物料', value: criticalCount, color: '#ff4757' },
  ];

  const refillColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', render: (v: string) => <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span> },
    { title: '物料', dataIndex: 'material', key: 'material', render: (v: string) => <span style={{ color: '#e8f4ff' }}>{v}</span> },
    { title: '入库量', dataIndex: 'amount', key: 'amount', render: (v: string) => <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace' }}>{v}</span> },
    { title: '操作人', dataIndex: 'operator', key: 'operator', render: (v: string) => <span style={{ color: '#6b8aad' }}>{v}</span> },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#080c18' }}>
      {/* Top Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '14px 24px',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{ color: s.color, fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {s.value}
            </span>
            <span style={{ color: '#6b8aad', fontSize: 14 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Material Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {inventory.map(mat => {
          const percent = Math.round((mat.current / mat.max) * 100);
          const isCritical = mat.current < mat.safety;
          const strokeColor = percent > 50 ? '#00ff88' : percent > 20 ? '#ffb800' : '#ff4757';
          const cat = categoryColor[mat.category] || { bg: 'rgba(255,255,255,0.08)', color: '#e8f4ff', border: 'rgba(255,255,255,0.2)' };

          return (
            <div key={mat.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${isCritical ? 'rgba(255,71,87,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12,
              padding: 16,
              position: 'relative',
            }}>
              {isCritical && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(255,71,87,0.2)',
                  color: '#ff4757',
                  border: '1px solid rgba(255,71,87,0.5)',
                  borderRadius: 6,
                  padding: '1px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  ⚠ 告急
                </div>
              )}
              <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700, marginBottom: 8, paddingRight: isCritical ? 52 : 0 }}>
                {mat.name}
              </div>
              <Tag style={{
                background: cat.bg,
                color: cat.color,
                border: `1px solid ${cat.border}`,
                borderRadius: 6,
                fontSize: 11,
                marginBottom: 14,
              }}>
                {mat.category}
              </Tag>
              <Progress
                percent={percent}
                strokeColor={strokeColor}
                trailColor="rgba(255,255,255,0.08)"
                showInfo={false}
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#e8f4ff', fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {mat.current}
                </span>
                <span style={{ color: '#6b8aad', fontSize: 13 }}>{mat.unit}</span>
              </div>
              <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 4 }}>
                安全线 {mat.safety} {mat.unit}
              </div>
              <div style={{ color: '#6b8aad', fontSize: 11 }}>最近入库：{mat.lastRefill}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Refill Log Table */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '16px 20px',
      }}>
        <div style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>快速入库记录</div>
        <Table
          dataSource={refillLogs}
          columns={refillColumns}
          rowKey="time"
          pagination={false}
          size="small"
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
}
