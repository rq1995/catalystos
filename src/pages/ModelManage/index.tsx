import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Button, Modal, Progress } from 'antd'
import { PlayCircleOutlined, FileTextOutlined, SwapOutlined, StarOutlined } from '@ant-design/icons'
import { models } from '../../mock/data'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  production: { label: '生产中', color: '#00ff88', bg: 'rgba(0,255,136,0.15)' },
  experiment: { label: '实验中', color: '#00d4ff', bg: 'rgba(0,212,255,0.15)' },
  training: { label: '训练中', color: '#ffb800', bg: 'rgba(255,184,0,0.15)' },
}

const algorithmColor: Record<string, string> = {
  GPR: '#00d4ff',
  XGBoost: '#7b61ff',
  'GNN+Transformer': '#ffb800',
}

function getScatterOption(mae: number, label: string, color: string) {
  const actual = [4000, 5000, 6000, 7000, 8000, 9000, 10000]
  const predicted = actual.map(v => v + (Math.random() - 0.5) * mae * 2)
  const minV = 3500, maxV = 11000
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item', backgroundColor: 'rgba(8,12,24,0.9)',
      borderColor: 'rgba(0,212,255,0.2)', textStyle: { color: '#e8f4ff' },
      formatter: (p: any) => `实测: ${Math.round(p.value[0])}<br/>预测: ${Math.round(p.value[1])}`,
    },
    legend: { data: [label, '理想预测'], textStyle: { color: '#6b8aad', fontSize: 9 }, top: 2 },
    grid: { left: 8, right: 8, top: 28, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value', name: '实测值', nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      min: minV, max: maxV,
      axisLabel: { color: '#6b8aad', fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value', name: '预测值', nameTextStyle: { color: '#6b8aad', fontSize: 9 },
      min: minV, max: maxV,
      axisLabel: { color: '#6b8aad', fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: label, type: 'scatter',
        data: actual.map((v, i) => [v, predicted[i]]),
        symbolSize: 9, itemStyle: { color, opacity: 0.9 },
      },
      {
        name: '理想预测', type: 'line',
        data: [[minV, minV], [maxV, maxV]],
        lineStyle: { color: 'rgba(255,255,255,0.3)', width: 1, type: 'dashed' },
        symbol: 'none',
        itemStyle: { color: 'rgba(255,255,255,0.3)' },
      },
    ],
  }
}

export default function ModelManage() {
  const [abModalOpen, setAbModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const productionModel = models.find(m => m.status === 'production')

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '16px 20px',
      background: '#080c18', display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div>
          <span style={{ color: '#e8f4ff', fontSize: 15, fontWeight: 600 }}>模型管理</span>
          {productionModel && (
            <span style={{ marginLeft: 12, color: '#6b8aad', fontSize: 12 }}>
              当前生产模型：
              <span style={{ color: '#00ff88', fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{productionModel.id}</span>
            </span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlayCircleOutlined />} size="small">发起新训练</Button>
      </div>

      {/* 模型卡片列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {models.map(model => {
          const statCfg = statusConfig[model.status] ?? statusConfig.experiment
          const algColor = algorithmColor[model.algorithm] ?? '#6b8aad'
          const isExpanded = expandedId === model.id
          const isProduction = model.status === 'production'

          return (
            <div key={model.id} style={{
              ...glass,
              padding: '16px 20px',
              borderColor: isProduction ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)',
              background: isProduction ? 'rgba(0,255,136,0.03)' : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onClick={() => setExpandedId(isExpanded ? null : model.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {isProduction && <StarOutlined style={{ color: '#00ff88', fontSize: 13 }} />}
                    <span style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 700 }}>{model.name}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#6b8aad' }}>{model.id}</span>
                    <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 4, background: `${algColor}18`, color: algColor, border: `1px solid ${algColor}40` }}>{model.algorithm}</span>
                    <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 4, background: statCfg.bg, color: statCfg.color }}>{statCfg.label}</span>
                  </div>
                  <div style={{ color: '#6b8aad', fontSize: 12 }}>{model.description}</div>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 2 }}>训练集</div>
                    <div style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700 }}>{model.trainSize}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 2 }}>MAE</div>
                    <div style={{ color: '#ffb800', fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700 }}>{model.mae}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 100 }}>
                    <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 4 }}>R² = {model.r2}</div>
                    <Progress
                      percent={Math.round(model.r2 * 100)}
                      strokeColor={model.r2 > 0.8 ? '#00ff88' : model.r2 > 0.7 ? '#ffb800' : '#ff4757'}
                      trailColor="rgba(255,255,255,0.08)"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                  {model.trainedAt && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6b8aad', fontSize: 10, marginBottom: 2 }}>训练日期</div>
                      <div style={{ color: '#6b8aad', fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{model.trainedAt}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  {!isProduction && model.status !== 'training' && (
                    <Button size="small" type="primary" ghost icon={<StarOutlined />} style={{ fontSize: 11 }}>设为生产</Button>
                  )}
                  <Button size="small" icon={<SwapOutlined />} style={{ fontSize: 11 }} onClick={() => setAbModalOpen(true)}>A/B对比</Button>
                  <Button size="small" icon={<FileTextOutlined />} style={{ fontSize: 11 }}>查看日志</Button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 8 }}>模型详情</div>
                      {[
                        { k: '算法', v: model.algorithm },
                        { k: '训练集大小', v: `${model.trainSize} 条` },
                        { k: 'MAE', v: `${model.mae} kg/mol·h` },
                        { k: 'R²', v: String(model.r2) },
                        { k: '状态', v: statCfg.label },
                        { k: '训练时间', v: model.trainedAt ?? '训练中...' },
                      ].map(item => (
                        <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ color: '#6b8aad' }}>{item.k}</span>
                          <span style={{ color: '#e8f4ff', fontFamily: "'JetBrains Mono',monospace" }}>{item.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 8 }}>交叉验证评分（5折）</div>
                      {Array.from({ length: 5 }, (_, i) => {
                        const score = (model.r2 - 0.05 + Math.random() * 0.1).toFixed(3)
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 6 }}>
                            <span style={{ color: '#6b8aad', width: 40 }}>Fold {i + 1}</span>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{ height: '100%', width: `${parseFloat(score) * 100}%`, background: '#00d4ff', borderRadius: 3 }} />
                            </div>
                            <span style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono',monospace" }}>{score}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* A/B 对比 Modal */}
      <Modal
        open={abModalOpen}
        onCancel={() => setAbModalOpen(false)}
        width={700}
        title={<span style={{ color: '#e8f4ff', fontSize: 15 }}>A/B 模型对比：GPR vs XGBoost</span>}
        footer={[<Button key="close" onClick={() => setAbModalOpen(false)}>关闭</Button>]}
        styles={{
          body: { background: '#0d1426', padding: '20px 24px' },
          header: { background: '#0d1426', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          footer: { background: '#0d1426', borderTop: '1px solid rgba(255,255,255,0.08)' },
          content: { background: '#0d1426', border: '1px solid rgba(0,212,255,0.2)' },
        }}
      >
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {[
              { model: models[0], color: '#00d4ff' },
              { model: models[1], color: '#7b61ff' },
            ].map(({ model, color }) => (
              <div key={model.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ textAlign: 'center', color, fontSize: 13, fontWeight: 700 }}>{model.name}</div>
                <div style={{ height: 220 }}>
                  <ReactECharts option={getScatterOption(model.mae, model.algorithm, color)} style={{ height: '100%' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#6b8aad', fontSize: 11, marginBottom: 10 }}>关键指标对比</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              {['指标', 'GPR (生产)', 'XGBoost (实验)'].map((h, i) => (
                <div key={i} style={{ padding: '6px 10px', color: '#6b8aad', fontSize: 11, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
              ))}
              {[
                { metric: 'MAE', gpr: '412', xgb: '387', winner: 'xgb' },
                { metric: 'R²', gpr: '0.831', xgb: '0.856', winner: 'xgb' },
                { metric: '训练时间', gpr: '2.3s', xgb: '18.6s', winner: 'gpr' },
                { metric: '推理速度', gpr: '0.8ms', xgb: '1.2ms', winner: 'gpr' },
                { metric: '解释性', gpr: '高 (置信区间)', xgb: '中 (SHAP)', winner: 'gpr' },
              ].flatMap(row => [
                <div key={`m-${row.metric}`} style={{ padding: '7px 10px', color: '#e8f4ff', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.metric}</div>,
                <div key={`g-${row.metric}`} style={{ padding: '7px 10px', color: row.winner === 'gpr' ? '#00ff88' : '#6b8aad', fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.gpr}</div>,
                <div key={`x-${row.metric}`} style={{ padding: '7px 10px', color: row.winner === 'xgb' ? '#00ff88' : '#6b8aad', fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.xgb}</div>,
              ])}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
