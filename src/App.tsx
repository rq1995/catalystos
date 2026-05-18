import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import ProcessMonitor from './pages/ProcessMonitor'
import Orchestration from './pages/Orchestration'
import AIRecommend from './pages/AIRecommend'
import WorkOrders from './pages/WorkOrders'
import Scheduling from './pages/Scheduling'
import SpectrumAnalysis from './pages/SpectrumAnalysis'
import DeviceTopo from './pages/DeviceTopo'
import AGVControl from './pages/AGVControl'
import AlarmCenter from './pages/AlarmCenter'
import CatalystDB from './pages/CatalystDB'
import ChemDB from './pages/ChemDB'
import SOPLibrary from './pages/SOPLibrary'
import DataScreen from './pages/DataScreen'
import StructurePerf from './pages/StructurePerf'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'
import DataCollection from './pages/DataCollection'
import ModelManage from './pages/ModelManage'
import ActiveLearning from './pages/ActiveLearning'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lab/process" element={<ProcessMonitor />} />
          <Route path="lab/orchestration" element={<Orchestration />} />
          <Route path="lab/workorders" element={<WorkOrders />} />
          <Route path="lab/scheduling" element={<Scheduling />} />
          <Route path="ai/recommend" element={<AIRecommend />} />
          <Route path="ai/models" element={<ModelManage />} />
          <Route path="ai/learning" element={<ActiveLearning />} />
          <Route path="devices/topology" element={<DeviceTopo />} />
          <Route path="devices/agv" element={<AGVControl />} />
          <Route path="devices/alarms" element={<AlarmCenter />} />
          <Route path="analysis/spectrum" element={<SpectrumAnalysis />} />
          <Route path="analysis/screen" element={<DataScreen />} />
          <Route path="analysis/structure" element={<StructurePerf />} />
          <Route path="knowledge/catalysts" element={<CatalystDB />} />
          <Route path="knowledge/chemdb" element={<ChemDB />} />
          <Route path="knowledge/sop" element={<SOPLibrary />} />
          <Route path="materials/inventory" element={<Inventory />} />
          <Route path="reports/list" element={<Reports />} />
          <Route path="reports/audit" element={<AuditLog />} />
          <Route path="system/datacollect" element={<DataCollection />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
