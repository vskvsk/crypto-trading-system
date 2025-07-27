// 加密货币数据类型定义
export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdate: number;
}

// K线数据类型
export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 订单类型
export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

// 持仓信息
export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

// WebSocket消息类型
export interface WSMessage {
  type: 'ticker' | 'kline' | 'depth' | 'trade';
  symbol: string;
  data: any;
}

// 技术指标配置
export interface IndicatorConfig {
  id: string;
  name: string;
  type: 'MA' | 'RSI' | 'MACD' | 'BOLL' | 'KDJ';
  params: Record<string, any>;
  visible: boolean;
}

// 用户资产
export interface UserAsset {
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  todayPnl: number;
  positions: Position[];
}

// 市场数据类型
export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
  lastUpdate: number;
}

// 订单簿数据
export interface OrderBookData {
  bids: [number, number][];
  asks: [number, number][];
  lastUpdate: number;
}

// 成交记录
export interface TradeData {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}