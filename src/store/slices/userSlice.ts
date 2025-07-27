import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserAsset, Position } from '../../types';

// 用户状态接口
interface UserState {
  // 用户信息
  userInfo: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  } | null;
  // 用户资产
  assets: UserAsset;
  // 登录状态
  isAuthenticated: boolean;
  // 用户偏好设置
  preferences: {
    theme: 'dark' | 'light';
    language: 'zh-CN' | 'en-US';
    defaultSymbol: string;
    chartInterval: string;
    soundEnabled: boolean;
    notificationEnabled: boolean;
  };
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  userInfo: null,
  assets: {
    totalBalance: 0,
    availableBalance: 0,
    frozenBalance: 0,
    todayPnl: 0,
    positions: [],
  },
  isAuthenticated: false,
  preferences: {
    theme: 'dark',
    language: 'zh-CN',
    defaultSymbol: 'BTCUSDT',
    chartInterval: '1h',
    soundEnabled: true,
    notificationEnabled: true,
  },
  loading: false,
  error: null,
};

// 创建用户切片
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 设置用户信息
    setUserInfo: (state, action: PayloadAction<UserState['userInfo']>) => {
      state.userInfo = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    // 更新用户资产
    updateAssets: (state, action: PayloadAction<UserAsset>) => {
      state.assets = action.payload;
    },
    
    // 更新单个持仓
    updatePosition: (state, action: PayloadAction<Position>) => {
      const position = action.payload;
      const existingIndex = state.assets.positions.findIndex(
        p => p.symbol === position.symbol
      );
      
      if (existingIndex !== -1) {
        state.assets.positions[existingIndex] = position;
      } else {
        state.assets.positions.push(position);
      }
    },
    
    // 删除持仓
    removePosition: (state, action: PayloadAction<string>) => {
      state.assets.positions = state.assets.positions.filter(
        p => p.symbol !== action.payload
      );
    },
    
    // 更新用户偏好
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.preferences.theme = action.payload;
    },
    
    // 设置语言
    setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.preferences.language = action.payload;
    },
    
    // 设置默认交易对
    setDefaultSymbol: (state, action: PayloadAction<string>) => {
      state.preferences.defaultSymbol = action.payload;
    },
    
    // 设置图表时间间隔
    setChartInterval: (state, action: PayloadAction<string>) => {
      state.preferences.chartInterval = action.payload;
    },
    
    // 切换声音提醒
    toggleSound: (state) => {
      state.preferences.soundEnabled = !state.preferences.soundEnabled;
    },
    
    // 切换通知提醒
    toggleNotification: (state) => {
      state.preferences.notificationEnabled = !state.preferences.notificationEnabled;
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 用户登出
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.assets = {
        totalBalance: 0,
        availableBalance: 0,
        frozenBalance: 0,
        todayPnl: 0,
        positions: [],
      };
      state.error = null;
    },
    
    // 清空错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出actions
export const {
  setUserInfo,
  updateAssets,
  updatePosition,
  removePosition,
  updatePreferences,
  setTheme,
  setLanguage,
  setDefaultSymbol,
  setChartInterval,
  toggleSound,
  toggleNotification,
  setLoading,
  setError,
  logout,
  clearError,
} = userSlice.actions;

// 导出reducer
export default userSlice.reducer;