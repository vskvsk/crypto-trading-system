import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App.tsx';
import { store } from './store';
import './styles/global.css';

// Ant Design 暗色主题配置
const darkTheme = {
  token: {
    colorPrimary: '#1890FF',
    colorBgBase: '#0B1426',
    colorBgContainer: '#243447',
    colorBgElevated: '#2A3F56',
    colorText: '#FFFFFF',
    colorTextSecondary: '#B8C5D1',
    colorTextTertiary: '#6B7785',
    colorBorder: '#3A4A5C',
    colorBorderSecondary: '#2A3F56',
    colorSuccess: '#52C41A',
    colorError: '#FF4D4F',
    colorWarning: '#FAAD14',
    colorInfo: '#1890FF',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#0B1426',
      headerBg: '#1A2332',
      siderBg: '#1A2332',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(24, 144, 255, 0.1)',
      darkItemHoverBg: 'rgba(24, 144, 255, 0.05)',
    },
    Button: {
      primaryShadow: 'none',
      dangerShadow: 'none',
    },
    Input: {
      colorBgContainer: '#1A2332',
      colorBorder: '#3A4A5C',
      activeBorderColor: '#1890FF',
      hoverBorderColor: '#4A5A6C',
    },
    Table: {
      colorBgContainer: '#243447',
      colorBgElevated: '#2A3F56',
      headerBg: '#1A2332',
      rowHoverBg: '#2A3F56',
    },
    Card: {
      colorBgContainer: '#243447',
      colorBorderSecondary: '#3A4A5C',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider 
        locale={zhCN}
        theme={darkTheme}
      >
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);