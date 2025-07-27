// 交易系统主题配置
export const theme = {
  colors: {
    // 主要背景色
    background: {
      primary: '#0B1426',      // 主背景 - 深蓝色
      secondary: '#1A2332',    // 次要背景
      card: '#243447',         // 卡片背景
      hover: '#2A3F56',        // 悬停背景
    },
    
    // 主色调
    primary: {
      main: '#1890FF',         // 科技蓝
      light: '#40A9FF',        // 浅蓝
      dark: '#096DD9',         // 深蓝
    },
    
    // 涨跌颜色
    success: '#52C41A',        // 涨 - 绿色
    danger: '#FF4D4F',         // 跌 - 红色
    
    // 文字颜色
    text: {
      primary: '#FFFFFF',      // 主要文字 - 白色
      secondary: '#B8C5D1',    // 次要文字 - 浅灰蓝
      disabled: '#6B7785',     // 禁用文字 - 深灰
      inverse: '#0B1426',      // 反色文字
    },
    
    // 边框颜色
    border: {
      primary: '#3A4A5C',      // 主要边框
      secondary: '#2A3F56',    // 次要边框
      light: '#4A5A6C',        // 浅色边框
    },
    
    // 状态颜色
    warning: '#FAAD14',        // 警告 - 橙色
    info: '#1890FF',           // 信息 - 蓝色
  },
  
  // 字体配置
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", Consolas, "Courier New", monospace',
  },
  
  // 间距配置
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // 圆角配置
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  // 阴影配置
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.25)',
  },
  
  // 层级配置
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// 响应式断点
export const breakpoints = {
  xs: '480px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1600px',
};