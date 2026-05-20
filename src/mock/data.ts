// ── 催化剂数据 ──────────────────────────────────────────
// 注：茂金属配合物的 SMILES 仅为示意，真实 η⁵ 配位键在 SMILES 中难以完整表达
// 各催化剂体系均为工业界实际使用的代表性茂金属催化剂类型
export const catalysts = [
  {
    id: 'CAT-2024-0045', metal: 'Zr', cocatalyst: 'MAO',
    name: 'rac-Et(Ind)₂ZrCl₂',
    fullName: 'rac-亚乙基双(茚基)二氯化锆',
    smiles: 'Cl[Zr](Cl)(C1=CC=CC2=CC=CC=C12)C1=CC=CC2=CC=CC=C12', // 简化表示，茚基配体
    ligandType: '桥连双茚基（C₂对称）',
    activity: 9240, pdi: 2.1, tm: 135.2, insertion: 8.2,
    source: 'experiment', confidence: 0.95,
    note: '等规聚丙烯主流催化剂，高活性，窄分布'
  },
  {
    id: 'CAT-2024-0044', metal: 'Hf', cocatalyst: 'Borate',
    name: 'Cp₂HfCl₂',
    fullName: '双(环戊二烯基)二氯化铪',
    smiles: 'Cl[Hf](Cl)(C1=CC=CC1)C1=CC=CC1', // η5-Cp 简化
    ligandType: '非桥连双茂环',
    activity: 7820, pdi: 1.8, tm: 138.1, insertion: 6.4,
    source: 'experiment', confidence: 0.92,
    note: '热稳定性优于 Zr 类似物，适合高温聚合'
  },
  {
    id: 'CAT-2024-0043', metal: 'Zr', cocatalyst: 'MAO',
    name: 'rac-Me₂Si(Ind)₂ZrCl₂',
    fullName: 'rac-二甲基硅基双(茚基)二氯化锆',
    smiles: 'Cl[Zr](Cl)(C1=CC=CC2=CC=CC=C12)[Si](C)(C)(C1=CC=CC2=CC=CC=C12)', // 简化
    ligandType: '硅桥连双茚基',
    activity: 8560, pdi: 2.3, tm: 133.8, insertion: 9.1,
    source: 'literature', confidence: 0.78,
    note: '刚性硅桥提升立构选择性，文献值'
  },
  {
    id: 'CAT-2024-0042', metal: 'Ti', cocatalyst: 'MAO',
    name: 'Cp₂TiCl₂',
    fullName: '双(环戊二烯基)二氯化钛',
    smiles: 'Cl[Ti](Cl)(C1=CC=CC1)C1=CC=CC1',
    ligandType: '非桥连双茂环',
    activity: 4320, pdi: 3.1, tm: 128.4, insertion: 12.3,
    source: 'simulation', confidence: 0.65,
    note: 'Ti 基活性较低，分子量分布较宽，模拟预测值'
  },
  {
    id: 'CAT-2024-0041', metal: 'Zr', cocatalyst: 'Borate',
    name: '(nBuCp)₂ZrCl₂',
    fullName: '双(正丁基环戊二烯基)二氯化锆',
    smiles: 'Cl[Zr](Cl)(C1=CC=CC1CCCC)C1=CC=CC1CCCC', // nBuCp 简化
    ligandType: '烷基取代茂环',
    activity: 10120, pdi: 1.9, tm: 136.7, insertion: 7.8,
    source: 'experiment', confidence: 0.97,
    note: 'n-丁基取代增强溶解性，活性最优批次'
  },
  {
    id: 'CAT-2024-0040', metal: 'Hf', cocatalyst: 'MAO',
    name: 'rac-Et(Ind)₂HfCl₂',
    fullName: 'rac-亚乙基双(茚基)二氯化铪',
    smiles: 'Cl[Hf](Cl)(C1=CC=CC2=CC=CC=C12)C1=CC=CC2=CC=CC=C12',
    ligandType: '桥连双茚基（C₂对称）',
    activity: 6890, pdi: 2.0, tm: 140.2, insertion: 5.9,
    source: 'literature', confidence: 0.82,
    note: '铪类桥连茚基，Tm 更高，文献报道值'
  },
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
// 工单名称采用茂金属催化剂聚合实验的标准命名规范
// 仪器类型为该领域真实使用的分析仪器
export const reports = [
  {
    id: 'RPT-20240518-001', workOrder: 'WO-20240518-047',
    name: 'rac-Et(Ind)₂ZrCl₂/MAO 丙烯聚合活性筛选',
    instrument: 'GPC-IR（凝胶渗透-红外联用）',
    created: '2024-05-18 10:30', started: '2024-05-18 08:00', generated: '2024-05-18 10:15',
    status: 'generated', operator: '张研究员'
  },
  {
    id: 'RPT-20240518-002', workOrder: 'WO-20240518-046',
    name: 'Al/Zr 比梯度优化实验（Zr/MAO 体系）',
    instrument: 'GPC（Waters 1515）+ DSC（TA Q2000）',
    created: '2024-05-18 09:45', started: '2024-05-18 09:30', generated: null,
    status: 'pending', operator: '李工程师'
  },
  {
    id: 'RPT-20240517-003', workOrder: 'WO-20240517-041',
    name: '(nBuCp)₂ZrCl₂ 丙烯/1-己烯共聚 α=0.15 系列',
    instrument: '¹³C NMR（Bruker Avance 400）+ GPC',
    created: '2024-05-17 16:20', started: '2024-05-17 10:00', generated: '2024-05-17 17:45',
    status: 'generated', operator: '王科学家'
  },
  {
    id: 'RPT-20240516-004', workOrder: 'WO-20240516-038',
    name: 'Cp₂HfCl₂/Borate 高温聚合（70°C）表征',
    instrument: 'DSC（TA Q2000）+ FTIR（Bruker Tensor）',
    created: '2024-05-16 14:00', started: '2024-05-16 08:30', generated: '2024-05-16 15:20',
    status: 'generated', operator: '赵博士'
  },
  {
    id: 'RPT-20240515-005', workOrder: 'WO-20240515-035',
    name: 'rac-Me₂Si(Ind)₂ZrCl₂ 低温等规 PP 合成（50°C）',
    instrument: 'GPC + ¹³C NMR + DSC（全套表征）',
    created: '2024-05-15 11:30', started: '2024-05-15 07:00', generated: '2024-05-16 09:00',
    status: 'generated', operator: '张研究员'
  },
  {
    id: 'RPT-20240514-006', workOrder: 'WO-20240514-031',
    name: 'MAO 用量对催化活性影响研究（Al/Zr=500~1200）',
    instrument: 'GPC（Waters Alliance）',
    created: '2024-05-14 09:00', started: '2024-05-14 08:00', generated: null,
    status: 'processing', operator: '李工程师'
  },
  {
    id: 'RPT-20240510-007', workOrder: 'WO-20240510-022',
    name: 'Et(Ind)₂ZrCl₂ 异常批次复现实验（飞温事件后）',
    instrument: 'GPC + ICP-OES（残余 Zr 金属分析）',
    created: '2024-05-10 13:00', started: '2024-05-10 09:00', generated: '2024-05-10 16:30',
    status: 'generated', operator: '安全组'
  },
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

// ── 设备控制层数据 ──────────────────────────────────────────
// 以下为新增的"实时设备控制"模块所用 mock 数据
// 设备命名规则：<TYPE>-<SERIAL>，反应釜相关子设备序号与 R-XX 对齐

// 32 路 MFC 质量流量控制器（每反应釜 1 路主气）
export const mfcDevices = Array.from({ length: 32 }, (_, i) => {
  const reactor = `R-${String(i + 1).padStart(2, '0')}`
  const gas = i % 3 === 0 ? '丙烯' : i % 3 === 1 ? '乙烯' : '氮气'
  const setpoint = parseFloat((1.5 + Math.random() * 1.5).toFixed(2))
  return {
    id: `MFC-${String(i + 1).padStart(2, '0')}`,
    reactor,
    gas,
    setpoint,
    actual: parseFloat((setpoint + (Math.random() - 0.5) * 0.05).toFixed(3)),
    totalizer: parseFloat((20 + Math.random() * 80).toFixed(2)),
    rangeMax: 5,
    status: i < 28 ? 'online' : 'offline',
  }
})

// 32 路 TCU 动态温控单元
export const tcuDevices = Array.from({ length: 32 }, (_, i) => {
  const reactor = `R-${String(i + 1).padStart(2, '0')}`
  const setpoint = 60 + Math.floor(Math.random() * 20)
  return {
    id: `TCU-${String(i + 1).padStart(2, '0')}`,
    reactor,
    mode: (i % 7 === 3 ? 'cool' : 'heat') as 'heat' | 'cool' | 'idle',
    setpoint,
    jacket: parseFloat((setpoint - 1.5 + Math.random() * 3).toFixed(2)),
    inner: parseFloat((setpoint - 0.5 + Math.random() * 1.2).toFixed(2)),
    pidP: 2.4,
    pidI: 0.18,
    pidD: 0.06,
    status: i < 28 ? 'online' : 'offline',
  }
})

// 32 路搅拌扭矩传感器
export const torqueSensors = Array.from({ length: 32 }, (_, i) => {
  const reactor = `R-${String(i + 1).padStart(2, '0')}`
  const torque = parseFloat((0.3 + Math.random() * 0.8).toFixed(3))
  return {
    id: `TRQ-${String(i + 1).padStart(2, '0')}`,
    reactor,
    rpm: 200 + Math.floor(Math.random() * 200),
    torque,
    threshold: 1.5,
    overload: torque > 1.5,
  }
})

// 气动阀门组（每反应釜 5 类阀，仅展示前 8 路用于演示）
const valveTypes = [
  { suffix: 'V1', name: '真空阀', type: 'vacuum' },
  { suffix: 'V2', name: '氮气阀', type: 'inert' },
  { suffix: 'V3', name: '单体进料阀', type: 'feed' },
  { suffix: 'V4', name: '泄压阀', type: 'vent' },
  { suffix: 'V5', name: '进样阀', type: 'inject' },
] as const
export const valveBank = Array.from({ length: 8 }, (_, i) => {
  const reactor = `R-${String(i + 1).padStart(2, '0')}`
  return valveTypes.map(v => ({
    id: `${reactor}-${v.suffix}`,
    name: `${v.name}-${reactor}`,
    type: v.type,
    state: 'closed' as 'open' | 'closed',
    reactor,
  }))
}).flat()

// 真空泵 × 2
export const vacuumPumps = [
  { id: 'VP-01', name: '真空泵 A', status: 'running', vacuumLevel: 12, runtime: 1247.3 },
  { id: 'VP-02', name: '真空泵 B', status: 'idle', vacuumLevel: 1013, runtime: 982.1 },
]

// H2O/O2 微量水氧分析仪 × 2（手套箱 A/B）
export const o2h2oSensors = [
  { id: 'GAS-01', location: '手套箱 A', h2o: 0.42, o2: 0.18, threshold: 1.0, interlocked: false },
  { id: 'GAS-02', location: '手套箱 B', h2o: 0.31, o2: 0.09, threshold: 1.0, interlocked: false },
]

// 高精度注射泵（4 通道 × 2 组 = 8 路）
const solvents = ['甲苯', '正己烷', 'MAO 10wt%', 'Cp₂ZrCl₂ 1mM', '异丙醇', 'HCl/EtOH', '丙烯液相', '空闲']
export const syringePumps = Array.from({ length: 8 }, (_, i) => ({
  id: `SP-${String(i + 1).padStart(2, '0')}`,
  channel: (i % 4) + 1,
  group: i < 4 ? 'A' : 'B',
  solvent: solvents[i],
  flowRate: parseFloat((50 + Math.random() * 150).toFixed(1)),
  volume: parseFloat((Math.random() * 5).toFixed(2)),
  pressure: parseFloat((0.05 + Math.random() * 0.1).toFixed(3)),
  status: i < 6 ? 'idle' : 'running',
}))

// 高精度天平 × 4
export const balances = [
  { id: 'BAL-01', location: '加样仪 A', weight: 0.0482, stable: true, tare: 12.345, capacity: 220 },
  { id: 'BAL-02', location: '加样仪 B', weight: 0.0125, stable: true, tare: 12.318, capacity: 220 },
  { id: 'BAL-03', location: '溶液配制台', weight: 4.823, stable: true, tare: 158.42, capacity: 2200 },
  { id: 'BAL-04', location: '产物称重', weight: 0, stable: true, tare: 0, capacity: 5000 },
]

// 多位切换阀（8 通道）× 4
export const rotaryValves = Array.from({ length: 4 }, (_, i) => ({
  id: `RV-${String(i + 1).padStart(2, '0')}`,
  group: i < 2 ? 'A' : 'B',
  currentPort: (i % 8) + 1,
  portMap: ['甲苯', '正己烷', '甲基环己烷', '氯苯', '废液', 'MAO', 'Borate', 'Bypass'],
}))

// 终止泵 × 4
export const quenchPumps = Array.from({ length: 4 }, (_, i) => {
  const reactor = `R-${String(i * 8 + 1).padStart(2, '0')}`
  return {
    id: `QP-${String(i + 1).padStart(2, '0')}`,
    reactor,
    status: 'standby' as 'standby' | 'injecting' | 'fault',
    injectedVolume: 0,
    targetVolume: 5,
    quencher: i % 2 === 0 ? '异丙醇' : 'HCl/EtOH',
    trigger: 'idle' as 'manual' | 'auto' | 'idle',
  }
})

// 背压泄放阀 × 4
export const backPressureValves = Array.from({ length: 4 }, (_, i) => {
  const reactor = `R-${String(i * 8 + 1).padStart(2, '0')}`
  return {
    id: `BPV-${String(i + 1).padStart(2, '0')}`,
    reactor,
    openPercent: 0,
    inletPressure: parseFloat((0.5 + Math.random() * 0.2).toFixed(3)),
    outletPressure: 0.101,
    ventRate: 0,
    maxVentRate: 0.05,
  }
})

// 全局控制指令日志（被各控制页 push）
export interface ControlLogEntry {
  id: string
  time: string
  user: string
  device: string
  action: string
  before: string | number
  after: string | number
}
export const controlLogs: ControlLogEntry[] = [
  { id: 'CTL-001', time: '14:22:15', user: '张研究员', device: 'TCU-08', action: '设定温度', before: 65, after: 68 },
  { id: 'CTL-002', time: '14:18:42', user: '李工程师', device: 'MFC-12', action: '设定流量', before: 2.0, after: 2.4 },
  { id: 'CTL-003', time: '14:05:09', user: '系统AI', device: 'R-08-V2', action: '阀门切换', before: 'closed', after: 'open' },
  { id: 'CTL-004', time: '13:55:31', user: '王科学家', device: 'SP-03', action: '启动注液', before: 'idle', after: 'running' },
  { id: 'CTL-005', time: '13:40:18', user: '张研究员', device: 'BPV-01', action: '设定开度', before: 0, after: 12 },
]

