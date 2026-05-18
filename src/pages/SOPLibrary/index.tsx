import React, { useState } from 'react';
import { Steps, Button, Tag } from 'antd';
import { sopLibrary } from '../../mock/data';

export default function SOPLibrary() {
  const [selectedId, setSelectedId] = useState(sopLibrary[0].id);
  const selected = sopLibrary.find(s => s.id === selectedId) || sopLibrary[0];

  const cardBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  };

  const stepsItems = selected.steps.map((step) => ({
    title: (
      <span style={{ color: '#e8f4ff', fontWeight: 600, fontSize: 14 }}>
        {step.name}
      </span>
    ),
    description: (
      <div style={{ paddingTop: 4, paddingBottom: 8 }}>
        <div style={{ color: '#6b8aad', fontSize: 13, marginBottom: 4 }}>{step.desc}</div>
        {step.check && (
          <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 2 }}>✓ {step.check}</div>
        )}
        {step.critical && (
          <div style={{ color: '#ffb800', fontSize: 12 }}>⚠ {step.critical}</div>
        )}
      </div>
    ),
  }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#080c18', display: 'flex', gap: 20 }}>
      {/* Left: SOP List */}
      <div style={{ width: '30%', flexShrink: 0 }}>
        <div style={{ color: '#e8f4ff', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>SOP 方法库</div>
        {sopLibrary.map(sop => (
          <div
            key={sop.id}
            onClick={() => setSelectedId(sop.id)}
            style={{
              ...cardBase,
              borderColor: selectedId === sop.id ? '#00d4ff' : 'rgba(255,255,255,0.08)',
              boxShadow: selectedId === sop.id ? '0 0 0 1px rgba(0,212,255,0.25)' : 'none',
            }}
          >
            <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{sop.name}</div>
            <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 8 }}>适用体系：{sop.system}</div>
            <Tag style={{
              background: 'rgba(0,212,255,0.1)',
              color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 6,
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 8,
            }}>
              {sop.version}
            </Tag>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ color: '#00ff88', fontSize: 22, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {sop.successRate}%
              </span>
              <span style={{ color: '#6b8aad', fontSize: 12 }}>成功率</span>
            </div>
            <div style={{ color: '#6b8aad', fontSize: 12 }}>使用次数：{sop.usedCount} 次</div>
          </div>
        ))}
      </div>

      {/* Right: Detail */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 24,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <span style={{ color: '#e8f4ff', fontSize: 18, fontWeight: 700 }}>{selected.name}</span>
            <Tag style={{
              background: 'rgba(0,212,255,0.1)',
              color: '#00d4ff',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 6,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {selected.version}
            </Tag>
            <span style={{
              background: 'rgba(0,255,136,0.12)',
              color: '#00ff88',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: 20,
              padding: '2px 12px',
              fontSize: 13,
            }}>
              {selected.successRate}% 成功率
            </span>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {[
              { label: '步骤数', value: selected.steps.length || '—', unit: '步' },
              { label: '使用次数', value: selected.usedCount, unit: '次' },
              { label: '最近更新', value: '2024-05-10', unit: '' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '10px 20px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#00d4ff', fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {stat.value}<span style={{ fontSize: 12, marginLeft: 2 }}>{stat.unit}</span>
                </div>
                <div style={{ color: '#6b8aad', fontSize: 12, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Steps */}
          {selected.steps.length > 0 ? (
            <div style={{ marginBottom: 28 }}>
              <Steps
                direction="vertical"
                current={4}
                items={stepsItems}
              />
            </div>
          ) : (
            <div style={{ color: '#6b8aad', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              暂无步骤详情
            </div>
          )}

          {/* Action */}
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0096ff)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              height: 40,
              padding: '0 24px',
              color: '#080c18',
            }}
          >
            基于此 SOP 创建工单
          </Button>
        </div>
      </div>
    </div>
  );
}
