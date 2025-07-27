import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, IndicatorConfig } from '../../types';

// 交易状态接口
interface TradingState {
  // 当前订单列表
  orders: Order[];
  // 订单历史
  orderHistory: Order[];
  // 技术指标配置
  indicators: IndicatorConfig[];
  // 交易面板状态
  tradingPanel: {
    orderType: 'market' | 'limit';
    side: 'buy' | 'sell';
    quantity: string;
    price: string;
  };
  // 深度数据
  orderBook: {
    bids: Array<[number, number]>; // [价格, 数量]
    asks: Array<[number, number]>;
  };
  // 最新成交记录
  recentTrades: Array<{
    price: number;
    quantity: number;
    time: number;
    side: 'buy' | 'sell';
  }>;
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
}

// 初始状态
const initialState: TradingState = {
  orders: [],
  orderHistory: [],
  indicators: [
    {
      id: 'ma20',
      name: '移动平均线(20)',
      type: 'MA',
      params: { period: 20 },
      visible: true,
    },
    {
      id: 'rsi14',
      name: 'RSI(14)',
      type: 'RSI',
      params: { period: 14 },
      visible: false,
    },
  ],
  tradingPanel: {
    orderType: 'limit',
    side: 'buy',
    quantity: '',
    price: '',
  },
  orderBook: {
    bids: [],
    asks: [],
  },
  recentTrades: [],
  loading: false,
  error: null,
};

// 创建交易切片
const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    // 添加订单
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    
    // 更新订单状态
    updateOrder: (state, action: PayloadAction<{ id: string; updates: Partial<Order> }>) => {
      const { id, updates } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
        
        // 如果订单已完成或取消，移动到历史记录
        if (updates.status === 'filled' || updates.status === 'cancelled') {
          const completedOrder = state.orders.splice(orderIndex, 1)[0];
          state.orderHistory.unshift(completedOrder);
        }
      }
    },
    
    // 取消订单
    cancelOrder: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = 'cancelled';
        const cancelledOrder = state.orders.splice(orderIndex, 1)[0];
        state.orderHistory.unshift(cancelledOrder);
      }
    },
    
    // 更新交易面板
    updateTradingPanel: (state, action: PayloadAction<Partial<TradingState['tradingPanel']>>) => {
      state.tradingPanel = { ...state.tradingPanel, ...action.payload };
    },
    
    // 添加技术指标
    addIndicator: (state, action: PayloadAction<IndicatorConfig>) => {
      state.indicators.push(action.payload);
    },
    
    // 更新技术指标
    updateIndicator: (state, action: PayloadAction<{ id: string; updates: Partial<IndicatorConfig> }>) => {
      const { id, updates } = action.payload;
      const indicatorIndex = state.indicators.findIndex(indicator => indicator.id === id);
      if (indicatorIndex !== -1) {
        state.indicators[indicatorIndex] = { ...state.indicators[indicatorIndex], ...updates };
      }
    },
    
    // 删除技术指标
    removeIndicator: (state, action: PayloadAction<string>) => {
      state.indicators = state.indicators.filter(indicator => indicator.id !== action.payload);
    },
    
    // 切换技术指标显示状态
    toggleIndicator: (state, action: PayloadAction<string>) => {
      const indicator = state.indicators.find(ind => ind.id === action.payload);
      if (indicator) {
        indicator.visible = !indicator.visible;
      }
    },
    
    // 更新订单簿
    updateOrderBook: (state, action: PayloadAction<{ bids: Array<[number, number]>; asks: Array<[number, number]> }>) => {
      state.orderBook = action.payload;
    },
    
    // 更新最新成交
    updateRecentTrades: (state, action: PayloadAction<TradingState['recentTrades']>) => {
      state.recentTrades = action.payload;
    },
    
    // 添加新成交记录
    addRecentTrade: (state, action: PayloadAction<TradingState['recentTrades'][0]>) => {
      state.recentTrades.unshift(action.payload);
      // 保持最多50条记录
      if (state.recentTrades.length > 50) {
        state.recentTrades = state.recentTrades.slice(0, 50);
      }
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 清空交易数据
    clearTradingData: (state) => {
      state.orders = [];
      state.orderBook = { bids: [], asks: [] };
      state.recentTrades = [];
      state.error = null;
    },
  },
});

// 导出actions
export const {
  addOrder,
  updateOrder,
  cancelOrder,
  updateTradingPanel,
  addIndicator,
  updateIndicator,
  removeIndicator,
  toggleIndicator,
  updateOrderBook,
  updateRecentTrades,
  addRecentTrade,
  setLoading,
  setError,
  clearTradingData,
} = tradingSlice.actions;

// 导出reducer
export default tradingSlice.reducer;