import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Table } from 'antd';

const adapters = [
  { id: 'opc',    name: 'OPC UA 适配器',    status: 'online',   latency: 12,  throughput: 342, files: null, reconnect: null },
  { id: 'modbus', name: 'Modbus TCP',        status: 'online',   latency: 8,   throughput: 156, files: null, reconnect: null },
  { id: 'rs232',  name: 'RS232 串口服务器',  status: 'degraded', latency: 280, throughput: null, files: null, reconnect: 3 },
  { id: 'file',   name: '文件监控守护进程',  status: 'online',   latency: null, throughput: null, files: 2847, reconnect: null },
];

const errorLogs = [
  { key: '1', time: '14:23:07', protocol: 'RS232',      device: 'NMR-01', type: 'TIMEOUT',   raw: '\\xFF\\x00\\xAB\\x12...', status: '已记录' },
  { key: '2', time: '14:19:44', protocol: 'Modbus TCP', device: 'R-21',   type: 'CRC_ERROR', raw: '01 03 00 06 00 01 64 0B', status: '已记录' },
  { key: '3', time: '14:12:33', protocol: 'RS232',      device: 'NMR-01', type: 'FRAME_ERR', raw: '\\xFF\\x01\\xCD\\x00...', status: '已记录' },
  { key: '4', time: '13:58:21', protocol: 'OPC UA',     device: 'R-15',   type: 'CONN_LOST', raw: 'StatusCode=0x80350000',   status: '已处理' },
  { key: '5', time: '13:41:05', protocol: 'Modbus TCP', device: 'GPC-01', type: 'TIMEOUT',   raw: '01 04 00 00 00 02 71 CB', status: '已处理' },
];

const pieOption = {
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8,12,24,0.9)',
    borderColor: 'rgba(255,255,255,0.1)',
    textStyle: { color: '#e8f4ff' },
    formatter: '{b}: {d}%',
  },
  legend: { show: false },
  series: [{
    type: 'pie',
    radius: ['50%', '75%'],
    center: ['50%', '50%'],
    data: [
      { value: 45, name: 'PostgreSQL',  itemStyle: { color: '#00d4ff' } },
      { value: 38, name: 'TimescaleDB', itemStyle: { color: '#7b61ff' } },
      { value: 17, name: 'MinIO',       itemStyle: { color: '#ffb800' } },
    ],
    label: { show: true, color: '#e8f4ff', fontSize: 11, formatter: '{b}\n{d}%' },
    labelLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
    itemStyle: { borderRadius: 4, borderColor: '#080c18', borderWidth: 2 },
  }],
};

function getThroughputOption(data: number[]) {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,12,24,0.9)',
      borderColor: 'rgba(0,212,255,0.2)',
      textStyle: { color: '#e8f4ff' },
      formatter: (p: { axisValue: string; value: number }[]) =>
        `${p[0]?.axisValue}s 前<br/>吞吐量: ${p[0]?.value} 条/s`,
    },
    grid: { left: 8, right: 8, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: Array.from({ length: 60 }, (_, i) =>
        i === 0 ? '60s' : i === 29 ? '30s' : i === 59 ? '0s' : ''),
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      name: '条/s',
      nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      min: 380,
      axisLabel: { color: '#6b8aad', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { show: false },
    },
    series: [{
      type: 'line' as const,
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#00d4ff', width: 2 },
      areaStyle: {
        color: {
          type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,212,255,0.25)' },
            { offset: 1, color: 'rgba(0,212,255,0.01)' },
          ],
        },
      },
    }],
  };
}

const errorColumns = [
  {
    title: '时间', dataIndex: 'time', key: 'time',
    render: (v: string) => <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6b8aad', fontSize: 12 }}>{v}</span>,
  },
  {
    title: '协议', dataIndex: 'protocol', key: 'protocol',
    render: (v: string) => {
      const c: Record<string, string> = { 'RS232': '#ffb800', 'Modbus TCP': '#7b61ff', 'OPC UA': '#00d4ff' };
      return <span style={{ color: c[v] || '#6b8aad', fontSize: 12, fontWeight: 600 }}>{v}</span>;
    },
  },
  {
    title: '设备ID', dataIndex: 'device', key: 'device',
    render: (v: string) => <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span>,
  },
  {
    title: '错误类型', dataIndex: 'type', key: 'type',
    render: (v: string) => (
      <span style={{
        background: 'rgba(255,71,87,0.15)', color: '#ff4757',
        border: '1px solid rgba(255,71,87,0.3)', borderRadius: 4,
        padding: '1px 8px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
      }}>{v}</span>
    ),
  },
  {
    title: '原始数据片段', dataIndex: 'raw', key: 'raw',
    render: (v: string) => (
      <span style={{
        color: '#3d5168', fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }} title={v}>{v}</span>
    ),
  },
  {
    title: '状态', dataIndex: 'status', key: 'status',
    render: (v: string) => (
      <span style={{
        color: v === '已处理' ? '#00ff88' : '#6b8aad',
        fontSize: 12,
      }}>{v}</span>
    ),
  },
];

export default function DataCollection() {
  const [throughputData, setThroughputData] = useState<number[]>(() =>
    Array.from({ length: 60 }, () => 480 + Math.floor(Math.random() * 120))
  );
  const [totalCount, setTotalCount] = useState(1284721);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = 480 + Math.floor(Math.random() * 120);
      setThroughputData(prev => [...prev.slice(1), next]);
      setTotalCount(prev => prev + 340 + Math.floor(Math.random() * 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#080c18' }}>
      {/* Protocol Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {adapters.map(ad => {
          const isOnline = ad.status === 'online';
          const dotColor = isOnline ? '#00ff88' : '#ffb800';
          return (
            <div key={ad.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${isOnline ? 'rgba(0,255,136,0.2)' : 'rgba(255,184,0,0.3)'}`,
              borderRadius: 12,
              padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: dotColor,
                  boxShadow: `0 0 6px ${dotColor}`,
                  flexShrink: 0,
                }} />
                <span style={{ color: dotColor, fontSize: 12, fontWeight: 600 }}>
                  {isOnline ? '在线' : '降级'}
                </span>
              </div>
              <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{ad.name}</div>
              {ad.latency !== null && (
                <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 4 }}>
                  延迟&nbsp;
                  <span style={{
                    color: ad.latency > 100 ? '#ffb800' : '#00ff88',
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                  }}>
                    {ad.latency}ms
                  </span>
                </div>
              )}
              {ad.throughput !== null && (
                <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 4 }}>
                  吞吐&nbsp;
                  <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {ad.throughput}条/s
                  </span>
                </div>
              )}
              {ad.reconnect !== null && (
                <div style={{ color: '#ff4757', fontSize: 12, marginBottom: 4 }}>
                  重连 {ad.reconnect} 次
                </div>
              )}
              {ad.files !== null && (
                <div style={{ color: '#6b8aad', fontSize: 12 }}>
                  已处理&nbsp;
                  <span style={{ color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {ad.files.toLocaleString()}
                  </span>
                  &nbsp;文件
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Middle: Throughput + Stats + Pie */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* Left 60%: Throughput Chart */}
        <div style={{
          flex: '0 0 60%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '16px 18px',
        }}>
          <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            数据转译层吞吐量
            <span style={{ color: '#6b8aad', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>实时（最近60秒）</span>
          </div>
          <ReactECharts
            option={getThroughputOption(throughputData)}
            style={{ height: 200 }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* Right 40%: Stats + Pie */}
        <div style={{ flex: '0 0 calc(40% - 16px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Success Rate + Total */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 8 }}>转译成功率</div>
              <div style={{
                color: '#00ff88', fontSize: 36, fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
              }}>
                99.7%
              </div>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#6b8aad', fontSize: 12, marginBottom: 8 }}>今日处理总量</div>
              <div style={{
                color: '#00d4ff', fontSize: 20, fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
              }}>
                {totalCount.toLocaleString()}
              </div>
              <div style={{ color: '#6b8aad', fontSize: 11, marginTop: 4 }}>条</div>
            </div>
          </div>

          {/* Pie Chart */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 16px',
          }}>
            <div style={{ color: '#e8f4ff', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>数据存储分布</div>
            <ReactECharts
              option={pieOption}
              style={{ height: 160 }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>
      </div>

      {/* Error Log Table */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '16px 20px',
      }}>
        <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          异常报文日志
          <span style={{ color: '#ff4757', marginLeft: 10, fontSize: 12, fontWeight: 400 }}>
            最近24小时 {errorLogs.length} 条
          </span>
        </div>
        <Table
          dataSource={errorLogs}
          columns={errorColumns}
          pagination={false}
          size="small"
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
}
