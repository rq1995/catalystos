// ── 催化剂数据 ──────────────────────────────────────────
export const catalysts = [
  { id: 'CAT-2024-0045', smiles: 'Cl[Zr](Cl)(C1=CC=CC=C1)C1=CC=CC=C1', metal: 'Zr', cocatalyst: 'MAO', activity: 9240, pdi: 2.1, tm: 135.2, insertion: 8.2, source: 'experiment', confidence: 0.95 },
  { id: 'CAT-2024-0044', smiles: 'Cl[Hf](Cl)(C1=CC=CC=C1)C1=CC=CC=C1', metal: 'Hf', cocatalyst: 'Borate', activity: 7820, pdi: 1.8, tm: 138.1, insertion: 6.4, source: 'experiment', confidence: 0.92 },
  { id: 'CAT-2024-0043', smiles: 'Cl[Zr](Cl)(C1=CC=C(C)C=C1)C1=CC=CC=C1', metal: 'Zr', cocatalyst: 'MAO', activity: 8560, pdi: 2.3, tm: 133.8, insertion: 9.1, source: 'literature', confidence: 0.78 },
  { id: 'CAT-2024-0042', smiles: 'Cl[Ti](Cl)(C1=CC=CC=C1)C1=CC=CC=C1', metal: 'Ti', cocatalyst: 'MAO', activity: 4320, pdi: 3.1, tm: 128.4, insertion: 12.3, source: 'simulation', confidence: 0.65 },
  { id: 'CAT-2024-0041', smiles: 'Cl[Zr](Cl)(C1=CC=CC=C1)C1=CC=C(C)C=C1', metal: 'Zr', cocatalyst: 'Borate', activity: 10120, pdi: 1.9, tm: 136.7, insertion: 7.8, source: 'experiment', confidence: 0.97 },
  { id: 'CAT-2024-0040', smiles: 'Cl[Hf](Cl)(C1=CC=CC=C1)C1=CC=C(C)C=C1', metal: 'Hf', cocatalyst: 'MAO', activity: 6890, pdi: 2.0, tm: 140.2, insertion: 5.9, source: 'literature', confidence: 0.82 },
]

// ── 实验批次数据 ──────────────────────────────────────────
export const experiments = [
  { id: 'EXP-2024-0045', catalyst: 'CAT-2024-0045', reactor: 'R-08', temp: 65, pressure: 0.6, alZrRatio: 850, duration: 90, comonomer: '1-己烯', comonomerRatio: 0.15, activity: 9240, pdi: 2.1, tm: 135.2, status: 'completed', operator: '张研究员', startTime: '2024-05-18 08:00', endTime: '2024-05-18 09:45' },
  { id: 'EXP-2024-0044', catalyst: 'CAT-2024-0044', reactor: 'R-12', temp: 70, pressure: 0.5, alZrRatio: 900, duration: 85, comonomer: '1-丁烯', comonomerRatio: 0.12, activity: 7820, pdi: 1.8, tm: 138.1, status: 'running', operator: '李工程师', startTime: '2024-05-18 09:30', endTime: null },
  { id: 'EXP-2024-0043', catalyst: 'CAT-2024-0043', reactor: 'R-15', temp: 60, pressure: 0.7, alZrRatio: 800, duration: 95, comonomer: '1-己烯', comonomerRatio: 0.18, activity: null, pdi: null, tm: null, status: 'pending', operator: '王科学家', startTime: null, endTime: null },
  { id: 'EXP-2024-0031', catalyst: 'CAT-2024-0031', reactor: 'R-03', temp: 114, pressure: 0.8, alZrRatio: 750, duration: 45, comonomer: '1-己烯', comonomerRatio: 0.1, activity: null, pdi: null, tm: null, status: 'failed', operator: '系统', startTime: '2024-05-17 14:00', endTime: '2024-05-17 14:45' },
]

// ── 设备数据 ──────────────────────────────────────────
export const devices = Array.from({ length: 32 }, (_, i) => ({
  id: `R-${String(i + 1).padStart(2, '0')}`,
  type: 'reactor',
  status: i < 28 ? (i % 7 === 3 ? 'warning' : 'running') : (i === 28 ? 'offline' : 'idle'),
  temp: 60 + Math.random() * 20,
  pressure: 0.4 + Math.random() * 0.4,
  rpm: 200 + Math.floor(Math.random() * 200),
  level: 0.4 + Math.random() * 0.5,
  experiment: i < 28 ? `EXP-2024-${String(45 - i).padStart(4, '0')}` : null,
  protocol: 'OPC UA',
}))

export const analysisDevices = [
  { id: 'GPC-01', name: 'GPC 凝胶色谱仪', status: 'running', protocol: 'Modbus TCP', latency: 12 },
  { id: 'DSC-01', name: 'DSC 差示扫描量热仪', status: 'idle', protocol: 'RS232', latency: 45 },
  { id: 'NMR-01', name: '¹H NMR 核磁共振仪', status: 'running', protocol: 'File Monitor', latency: 280 },
  { id: 'IR-01', name: 'FTIR 红外光谱仪', status: 'idle', protocol: 'OPC UA', latency: 8 },
]

// ── 告警数据 ──────────────────────────────────────────
export const alarms = [
  { id: 'ALM-001', level: 'critical', device: 'R-08', message: '反应温度飞升 114°C > 110°C 阈值', action: '自动联锁：开启泄压阀，注入终止剂', status: 'resolved', time: '2分钟前', handled: true },
  { id: 'ALM-002', level: 'warning', device: 'GPC-01', message: '进样针压力偏高 18.2 MPa > 15 MPa', action: '待处理', status: 'pending', time: '8分钟前', handled: false },
  { id: 'ALM-003', level: 'info', device: 'AGV-002', message: '电量 23%，建议充电', action: '已知晓', status: 'acknowledged', time: '15分钟前', handled: true },
  { id: 'ALM-004', level: 'warning', device: 'R-21', message: '搅拌转速波动 ±30 RPM 超出正常范围', action: '待处理', status: 'pending', time: '22分钟前', handled: false },
  { id: 'ALM-005', level: 'info', device: 'NMR-01', message: '文件监控队列积压 12 个文件', action: '已知晓', status: 'acknowledged', time: '35分钟前', handled: true },
]

// ── 工单数据 ──────────────────────────────────────────
export const workOrders = [
  { id: 'WO-20240518-047', name: 'AI推荐配方验证 #47', catalyst: 'CAT-2024-0045', reactor: 'R-08', status: 'completed', priority: 'ai', duration: 95, progress: 100, operator: '张研究员', activity: 9240, pdi: 2.1 },
  { id: 'WO-20240518-046', name: '高Al/Zr比探索实验', catalyst: 'CAT-2024-0044', reactor: 'R-12', status: 'running', priority: 'normal', duration: 85, progress: 67, operator: '李工程师', activity: null, pdi: null },
  { id: 'WO-20240518-045', name: '温度扫描系列 T=60°C', catalyst: 'CAT-2024-0043', reactor: 'R-15', status: 'analyzing', priority: 'normal', duration: 90, progress: 100, operator: '王科学家', activity: null, pdi: null },
  { id: 'WO-20240518-044', name: 'Hf基催化剂基线', catalyst: 'CAT-2024-0042', reactor: 'R-03', status: 'pending', priority: 'urgent', duration: 80, progress: 0, operator: '赵博士', activity: null, pdi: null },
  { id: 'WO-20240518-043', name: '共单体进料比优化 α=0.18', catalyst: 'CAT-2024-0041', reactor: null, status: 'review', priority: 'ai', duration: 100, progress: 0, operator: '张研究员', activity: null, pdi: null },
  { id: 'WO-20240518-042', name: '低温聚合实验 T=50°C', catalyst: 'CAT-2024-0040', reactor: null, status: 'review', priority: 'normal', duration: 110, progress: 0, operator: '李工程师', activity: null, pdi: null },
]

// ── 物料库存 ──────────────────────────────────────────
export const inventory = [
  { id: 'MAT-001', name: '甲基铝氧烷 (MAO)', category: '助催化剂', unit: 'L', current: 4.1, safety: 1.0, max: 5.0, lastRefill: '2024-05-15', cas: '118492-49-2' },
  { id: 'MAT-002', name: '丙烯 (聚合级)', category: '单体', unit: 'kg', current: 28.4, safety: 5.0, max: 50.0, lastRefill: '2024-05-17', cas: '115-07-1' },
  { id: 'MAT-003', name: '1-己烯 (共单体)', category: '单体', unit: 'L', current: 1.2, safety: 2.0, max: 10.0, lastRefill: '2024-05-10', cas: '592-41-6' },
  { id: 'MAT-004', name: '甲苯 (溶剂)', category: '溶剂', unit: 'L', current: 18.5, safety: 3.0, max: 20.0, lastRefill: '2024-05-16', cas: '108-88-3' },
  { id: 'MAT-005', name: '正己烷 (溶剂)', category: '溶剂', unit: 'L', current: 12.3, safety: 3.0, max: 20.0, lastRefill: '2024-05-14', cas: '110-54-3' },
  { id: 'MAT-006', name: 'Cp₂ZrCl₂ 原料', category: '催化剂原料', unit: 'g', current: 8.7, safety: 5.0, max: 20.0, lastRefill: '2024-05-12', cas: '1291-32-3' },
  { id: 'MAT-007', name: 'Cp₂HfCl₂ 原料', category: '催化剂原料', unit: 'g', current: 0.8, safety: 2.0, max: 10.0, lastRefill: '2024-04-28', cas: '12116-66-4' },
  { id: 'MAT-008', name: '硼酸三乙酯 (助催化剂)', category: '助催化剂', unit: 'mL', current: 45.2, safety: 10.0, max: 100.0, lastRefill: '2024-05-08', cas: '150-46-9' },
]

// ── 实验报告列表 ──────────────────────────────────────────
export const reports = [
  { id: 'RPT-20240518-001', workOrder: 'WO-20240518-047', name: '茂金属聚合分析实验', instrument: 'GPC + DSC', created: '2024-05-18 10:30', started: '2024-05-18 08:00', generated: '2024-05-18 10:15', status: 'generated', operator: '张研究员' },
  { id: 'RPT-20240517-008', workOrder: 'WO-20240517-038', name: '立架+投料+反应', instrument: 'Carousel1, AGV-1, C1', created: '2024-04-17 12:49', started: '2024-04-17 08:00', generated: '2024-04-17 21:02', status: 'pending', operator: 'Admin' },
  { id: 'RPT-20240517-007', workOrder: 'WO-20240517-037', name: '立架-依立特', instrument: 'Carousel1, AGV-1, C1', created: '2024-04-17 12:52', started: '2024-04-17 11:12', generated: '2024-04-17 11:26', status: 'generated', operator: 'Admin' },
  { id: 'RPT-20240402-003', workOrder: 'WO-20240402-012', name: '立座+氛吹', instrument: 'Carousel1, AGV-1, C1', created: '2024-04-02 01:44', started: '2024-04-16 18:29', generated: '2024-04-16 18:46', status: 'pending', operator: 'Admin' },
  { id: 'RPT-20240401-002', workOrder: 'WO-20240401-008', name: '演示工单(测试)', instrument: 'Carousel1, Flash, C1', created: '2024-04-01 17:04', started: '2024-04-01 09:00', generated: '2024-04-01 17:04', status: 'generated', operator: 'Admin' },
  { id: 'RPT-20240315-001', workOrder: 'WO-20240315-001', name: '聚合物分析实验', instrument: 'Carousel1, AGV-1, A1', created: '2024-03-15 05:47', started: '2024-03-15 08:00', generated: '2024-03-15 05:47', status: 'generated', operator: 'Admin' },
]

// ── SOP 方法库 ──────────────────────────────────────────
export const sopLibrary = [
  {
    id: 'SOP-001', name: '茂金属催化剂标准聚合方案', system: 'Zr/MAO', version: 'v3.2', successRate: 94.2, usedCount: 127,
    steps: [
      { seq: 1, name: '系统气密性置换', desc: '通入高纯氮气至 0.3 MPa，保压 10 min', check: '压降 < 0.005 MPa/min', critical: '氮气纯度 > 99.999%' },
      { seq: 2, name: '溶剂加料', desc: '加入 200 mL 甲苯，搅拌均匀', check: '液位传感器确认', critical: '甲苯含水量 < 5 ppm' },
      { seq: 3, name: '单体加料', desc: '通入丙烯至饱和，记录进料量', check: '流量计读数稳定', critical: '单体纯度 > 99.5%' },
      { seq: 4, name: '助催化剂注入', desc: 'MAO 溶液 (10 wt%) 注入，Al/Zr=850', check: '注入量精度 ±0.01 mL', critical: '避免暴露空气' },
      { seq: 5, name: '催化剂注入', desc: 'Cp₂ZrCl₂ 甲苯溶液 (1 mM) 注入', check: '注入完成确认', critical: '温度 < 25°C 时注入' },
      { seq: 6, name: '恒温恒压聚合', desc: '升温至 65°C，维持 90 min', check: '温度 ±1°C，压力 ±0.02 MPa', critical: '飞温阈值 110°C 联锁' },
      { seq: 7, name: '淬灭/终止', desc: '注入终止剂 (异丙醇 5 mL)，降温', check: '压力降至常压', critical: '快速终止避免降解' },
      { seq: 8, name: '产物后处理与分析', desc: '过滤、干燥，取样送 GPC/DSC 分析', check: '样品重量 > 0.5 g', critical: '保存条件 < 40°C 干燥' },
    ]
  },
  { id: 'SOP-002', name: '高通量筛选方案 (32釜并行)', system: 'Multi-metal', version: 'v1.8', successRate: 87.1, usedCount: 48, steps: [] },
  { id: 'SOP-003', name: '低温聚合实验方案 (T=40°C)', system: 'Zr/Borate', version: 'v2.1', successRate: 78.5, usedCount: 23, steps: [] },
  { id: 'SOP-004', name: 'GPC 表征标准操作程序', system: '分析', version: 'v4.0', successRate: 99.1, usedCount: 312, steps: [] },
]

// ── 模型数据 ──────────────────────────────────────────
export const models = [
  { id: 'GPR-v1.2', name: '高斯过程回归', algorithm: 'GPR', trainSize: 156, mae: 412, r2: 0.831, status: 'production', trainedAt: '2024-05-10', description: '当前生产模型，适合小样本预测' },
  { id: 'XGB-v2.0', name: 'XGBoost 多任务', algorithm: 'XGBoost', trainSize: 156, mae: 387, r2: 0.856, status: 'experiment', trainedAt: '2024-05-16', description: 'A/B 测试中，MAE 优于 GPR 6%' },
  { id: 'GNN-trial', name: '图神经网络', algorithm: 'GNN+Transformer', trainSize: 156, mae: 623, r2: 0.712, status: 'training', trainedAt: null, description: '训练中，需更多数据支撑' },
]

// ── 审计日志 ──────────────────────────────────────────
export const auditLogs = [
  { id: 'LOG-001', time: '2024-05-18 14:23:07', user: '张研究员', role: '实验科学家', action: '参数修改', detail: 'R-08 温度上限 110→108°C', before: '110°C', after: '108°C', ip: '192.168.1.45' },
  { id: 'LOG-002', time: '2024-05-18 14:18:52', user: '系统AI', role: 'AI引擎', action: '工单生成', detail: '自动生成实验工单 WO-20240518-047', before: null, after: 'WO-20240518-047', ip: 'system' },
  { id: 'LOG-003', time: '2024-05-18 14:05:33', user: '李工程师', role: '设备工程师', action: '手动接管', detail: 'AGV-003 手动切换至待命模式', before: '自动模式', after: '手动待命', ip: '192.168.1.52' },
  { id: 'LOG-004', time: '2024-05-18 13:47:19', user: '张研究员', role: '实验科学家', action: 'AI推荐确认', detail: '确认实验方案 REP-2024-0847，一键同意', before: '待审核', after: '已确认', ip: '192.168.1.45' },
  { id: 'LOG-005', time: '2024-05-18 13:30:04', user: '王科学家', role: '实验科学家', action: '实验启动', detail: 'EXP-2024-0043 在 R-15 开始执行', before: '待执行', after: '执行中', ip: '192.168.1.61' },
  { id: 'LOG-006', time: '2024-05-18 12:55:22', user: '系统', role: '联锁系统', action: '安全联锁', detail: 'R-08 温度飞升，自动开启泄压阀', before: '114°C', after: '联锁触发', ip: 'system' },
  { id: 'LOG-007', time: '2024-05-18 11:20:15', user: '管理员', role: '系统管理员', action: '模型切换', detail: 'AI预测模型切换 GPR-v1.1 → GPR-v1.2', before: 'GPR-v1.1', after: 'GPR-v1.2', ip: '192.168.1.10' },
]

// ── 物化数据库 ──────────────────────────────────────────
export const chemDB = Array.from({ length: 20 }, (_, i) => ({
  cid: 1200000 - i,
  formula: ['C58H94O6', 'C17H22NO5S', 'C14H15BrNO', 'C25H34NO3', 'C13H11Cl2NS', 'C25H35N2O4', 'C11H8ClN2O2S', 'C18H23BrN2O2'][i % 8],
  smiles: 'CCC=CCC=CC=CCCC(=O)OCCCCC',
  mw: (200 + i * 47.3).toFixed(3),
  exactMw: (199.8 + i * 47.1).toFixed(4),
  xlogP: (-2 + i * 0.8).toFixed(4),
  tpsa: (20 + i * 6.5).toFixed(2),
  hbDonor: i % 4,
  hbAcceptor: 2 + (i % 6),
  rotatable: i % 10,
  heavyAtoms: 15 + i * 3,
  aromatic: i % 3,
}))
