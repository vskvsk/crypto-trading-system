import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CryptoData, KlineData } from '../../types';

// 市场数据状态接口
interface MarketState {
  // 当前选中的交易对
  selectedSymbol: string;
  // 加密货币列表
  cryptoList: CryptoData[];
  // K线数据
  klineData: Record<string, KlineData[]>;
  // WebSocket连接状态
  wsConnected: boolean;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 收藏的币种
  favorites: string[];
  // 行情数据更新时间
  lastUpdate: number;
}

// 初始状态
const initialState: MarketState = {
  selectedSymbol: 'BTCUSDT',
  cryptoList: [],
  klineData: {},
  wsConnected: false,
  loading: false,
  error: null,
  favorites: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
  lastUpdate: 0,
};

// 创建市场数据切片
const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    // 设置选中的交易对
    setSelectedSymbol: (state, action: PayloadAction<string>) => {
      state.selectedSymbol = action.payload;
    },
    
    // 更新加密货币列表
    updateCryptoList: (state, action: PayloadAction<CryptoData[]>) => {
      state.cryptoList = action.payload;
      state.lastUpdate = Date.now();
    },
    
    // 更新单个加密货币数据
    updateCryptoData: (state, action: PayloadAction<CryptoData>) => {
      const index = state.cryptoList.findIndex(
        crypto => crypto.symbol === action.payload.symbol
      );
      if (index !== -1) {
        state.cryptoList[index] = action.payload;
      } else {
        state.cryptoList.push(action.payload);
      }
      state.lastUpdate = Date.now();
    },
    
    // 更新K线数据
    updateKlineData: (state, action: PayloadAction<{ symbol: string; data: KlineData[] }>) => {
      const { symbol, data } = action.payload;
      state.klineData[symbol] = data;
    },
    
    // 添加新的K线数据点
    addKlineData: (state, action: PayloadAction<{ symbol: string; data: KlineData }>) => {
      const { symbol, data } = action.payload;
      if (!state.klineData[symbol]) {
        state.klineData[symbol] = [];
      }
      state.klineData[symbol].push(data);
    },
    
    // 设置WebSocket连接状态
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 添加收藏
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    
    // 移除收藏
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(symbol => symbol !== action.payload);
    },
    
    // 清空数据
    clearMarketData: (state) => {
      state.cryptoList = [];
      state.klineData = {};
      state.error = null;
    },
  },
});

// 导出actions
export const {
  setSelectedSymbol,
  updateCryptoList,
  updateCryptoData,
  updateKlineData,
  addKlineData,
  setWsConnected,
  setLoading,
  setError,
  addFavorite,
  removeFavorite,
  clearMarketData,
} = marketSlice.actions;

// 导出reducer
export default marketSlice.reducer;