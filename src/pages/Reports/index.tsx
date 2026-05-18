import React, { useState } from 'react';
import { Table, Input, Select, Button, Modal, Tag, Badge } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { reports } from '../../mock/data';

type Report = typeof reports[0];

const statusMap: Record<string, { color: string; bg: string; border: string; label: string }> = {
  generated: { color: '#00ff88', bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.35)', label: '已生成' },
  pending:   { color: '#6b8aad', bg: 'rgba(107,138,173,0.12)', border: 'rgba(107,138,173,0.35)', label: '未生成' },
  processing:{ color: '#00d4ff', bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.35)', label: '处理中' },
};

export default function Reports() {
  const [filterWO, setFilterWO] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterInstr, setFilterInstr] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filtered = reports.filter(r => {
    if (filterWO && !r.id.toLowerCase().includes(filterWO.toLowerCase())) return false;
    if (filterName && !r.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterInstr && !r.instrument.toLowerCase().includes(filterInstr)) return false;
    return true;
  });

  const columns = [
    {
      title: '工单编号', dataIndex: 'id', key: 'id',
      render: (v: string) => <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00d4ff', fontSize: 12 }}>{v}</span>,
    },
    { title: '工单名称', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ color: '#e8f4ff' }}>{v}</span> },
    { title: '仪器类型', dataIndex: 'instrument', key: 'instrument', render: (v: string) => <span style={{ color: '#6b8aad', fontSize: 12 }}>{v}</span> },
    { title: '创建时间', dataIndex: 'created', key: 'created', render: (v: string) => <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span> },
    { title: '开始时间', dataIndex: 'started', key: 'started', render: (v: string) => <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span> },
    { title: '生成时间', dataIndex: 'generated', key: 'generated', render: (v: string) => <span style={{ color: '#6b8aad', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span> },
    {
      title: '生成状态', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const s = statusMap[v] || statusMap.pending;
        return (
          <span style={{
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            borderRadius: 20, padding: '2px 10px', fontSize: 12,
          }}>
            {s.label}
          </span>
        );
      },
    },
    { title: '创建人', dataIndex: 'operator', key: 'operator', render: (v: string) => <span style={{ color: '#6b8aad' }}>{v}</span> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Report) => (
        <Button
          size="small"
          onClick={() => { setSelectedReport(record); setModalOpen(true); }}
          style={{
            background: 'rgba(0,212,255,0.1)',
            color: '#00d4ff',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 6,
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  const formulaData = [
    { param: '催化剂', value: 'Cp₂ZrCl₂ / MAO' },
    { param: '温度', value: '65 °C' },
    { param: '压力', value: '0.60 MPa' },
    { param: 'Al:Zr 比', value: '850 : 1' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#080c18' }}>
      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Input
          placeholder="工单编号"
          value={filterWO}
          onChange={e => setFilterWO(e.target.value)}
          style={{ width: 180, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#e8f4ff' }}
          allowClear
        />
        <Input
          placeholder="工单名称"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          style={{ width: 180, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#e8f4ff' }}
          allowClear
        />
        <Select
          placeholder="仪器类型"
          value={filterInstr}
          onChange={v => setFilterInstr(v)}
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 'gpc', label: 'GPC' },
            { value: 'dsc', label: 'DSC' },
          ]}
        />
        <Button
          type="primary"
          style={{ background: 'linear-gradient(135deg,#00d4ff,#0096ff)', border: 'none', borderRadius: 8, color: '#080c18', fontWeight: 600 }}
        >
          查询
        </Button>
        <Button
          onClick={() => { setFilterWO(''); setFilterName(''); setFilterInstr(undefined); }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#6b8aad' }}
        >
          重置
        </Button>
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
        title={null}
        styles={{ content: { background: '#0d1428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 0 } }}
      >
        {selectedReport && (
          <div style={{ padding: 28 }}>
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#e8f4ff', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {selectedReport.name}
              </div>
              <div style={{ color: '#6b8aad', fontSize: 13 }}>
                实验批次：
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00d4ff' }}>
                  {selectedReport.workOrder}
                </span>
              </div>
            </div>

            {/* Formula Params Table */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>配方参数</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                {formulaData.map((row, i) => (
                  <div key={row.param} style={{
                    display: 'flex',
                    padding: '10px 16px',
                    borderBottom: i < formulaData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ color: '#6b8aad', width: 120, fontSize: 13 }}>{row.param}</span>
                    <span style={{ color: '#e8f4ff', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Desc */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>过程描述</div>
              <div style={{ color: '#6b8aad', fontSize: 13, lineHeight: 1.8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px' }}>
                实验于 {selectedReport.started} 启动，反应器完成气密置换后加入甲苯溶剂 200 mL，随后通入聚合级丙烯至饱和。
                按 Al/Zr = 850 注入 MAO 助催化剂，再注入 Cp₂ZrCl₂ 催化剂甲苯溶液，升温至 65°C 恒温恒压聚合 90 分钟。
                反应结束后注入异丙醇终止，降温过滤，产物经 GPC 和 DSC 分析。
              </div>
            </div>

            {/* AI Rating */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>AI 综合评级</div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#ffb800', fontSize: 22, marginBottom: 8 }}>★★★★☆</div>
                <div style={{ color: '#6b8aad', fontSize: 13, lineHeight: 1.7 }}>
                  实验结果良好，催化活性达到 9,240 gPE/(mol·h)，处于同类催化剂优秀区间。建议下一批次适当提高 Al/Zr 比至 900 以探索活性上限，并关注 PDI 变化趋势。
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Button
                icon={<DownloadOutlined />}
                disabled
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  color: '#6b8aad',
                  cursor: 'not-allowed',
                }}
              >
                下载 PDF
              </Button>
              <span style={{ color: '#6b8aad', fontSize: 12 }}>功能开发中</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
