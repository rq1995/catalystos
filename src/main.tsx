import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './styles/theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d4ff',
          colorBgBase: '#080c18',
          colorBgContainer: 'rgba(255,255,255,0.04)',
          colorBgElevated: '#0d1830',
          colorBorder: 'rgba(255,255,255,0.08)',
          colorText: '#e8f4ff',
          colorTextSecondary: '#6b8aad',
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
