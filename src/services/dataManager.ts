import { cryptoAPI } from './api';
import { WebSocketService } from './websocket';
import type { CryptoData, KlineData, OrderBookData, TradeData } from '../types';

export type DataSource = 'websocket' | 'api' | 'fallback';

export interface DataManagerConfig {
  preferredSource: DataSource;
  fallbackEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export class DataManager {
  private static instance: DataManager;
  private config: DataManagerConfig;
  private wsService: WebSocketService;
  private currentSource: DataSource = 'websocket';
  private retryCount = 0;
  private listeners: { [key: string]: Function[] } = {};

  constructor(config: Partial<DataManagerConfig> = {}) {
    this.config = {
      preferredSource: 'websocket',
      fallbackEnabled: true,
      retryAttempts: 3,
      retryDelay: 5000,
      ...config
    };
    
    this.wsService = WebSocketService.getInstance();
    this.setupWebSocketListeners();
  }

  static getInstance(config?: Partial<DataManagerConfig>): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager(config);
    }
    return DataManager.instance;
  }

  // 设置WebSocket监听器
  private setupWebSocketListeners() {
    this.wsService.on('connect', () => {
      console.log('WebSocket连接成功，切换到WebSocket数据源');
      this.currentSource = 'websocket';
      this.retryCount = 0;
      this.emit('sourceChanged', 'websocket');
    });

    this.wsService.on('disconnect', () => {
      console.log('WebSocket连接断开，准备切换到API数据源');
      if (this.config.fallbackEnabled) {
        this.switchToAPI();
      }
    });

    this.wsService.on('error', (error) => {
      console.error('WebSocket错误:', error);
      if (this.config.fallbackEnabled && this.retryCount < this.config.retryAttempts) {
        this.retryCount++;
        setTimeout(() => {
          this.switchToAPI();
        }, this.config.retryDelay);
      }
    });

    // 转发WebSocket数据
    this.wsService.on('priceUpdate', (data) => {
      this.emit('priceUpdate', data);
    });

    this.wsService.on('klineUpdate', (data) => {
      this.emit('klineUpdate', data);
    });

    this.wsService.on('orderBookUpdate', (data) => {
      this.emit('orderBookUpdate', data);
    });

    this.wsService.on('tradeUpdate', (data) => {
      this.emit('tradeUpdate', data);
    });
  }

  // 切换到API数据源
  private async switchToAPI() {
    console.log('切换到API数据源');
    this.currentSource = 'api';
    this.emit('sourceChanged', 'api');
    
    // 开始定期获取API数据
    this.startAPIPolling();
  }

  // 开始API轮询
  private startAPIPolling() {
    // 每30秒获取一次币种列表
    setInterval(async () => {
      if (this.currentSource === 'api') {
        try {
          const coinList = await cryptoAPI.getCoinList();
          this.emit('coinListUpdate', coinList);
        } catch (error) {
          console.error('API获取币种列表失败:', error);
        }
      }
    }, 30000);

    // 每5秒获取一次当前选中币种的数据
    setInterval(async () => {
      if (this.currentSource === 'api') {
        const currentSymbol = this.getCurrentSymbol();
        if (currentSymbol) {
          try {
            // 并行获取多种数据
            const [price, orderBook, trades] = await Promise.all([
              cryptoAPI.getPrice(currentSymbol),
              cryptoAPI.getOrderBook(currentSymbol),
              cryptoAPI.getRecentTrades(currentSymbol)
            ]);

            this.emit('priceUpdate', { symbol: currentSymbol, price });
            this.emit('orderBookUpdate', orderBook);
            this.emit('tradeUpdate', trades);
          } catch (error) {
            console.error('API获取实时数据失败:', error);
          }
        }
      }
    }, 5000);
  }

  // 获取币种列表
  async getCoinList(): Promise<CoinData[]> {
    try {
      if (this.currentSource === 'websocket') {
        // WebSocket模式下使用模拟数据
        return this.getSimulatedCoinList();
      } else {
        // API模式下获取真实数据
        return await cryptoAPI.getCoinList();
      }
    } catch (error) {
      console.error('获取币种列表失败:', error);
      return this.getSimulatedCoinList();
    }
  }

  // 获取K线数据
  async getKlineData(symbol: string, interval: string = '1m'): Promise<KlineData[]> {
    try {
      if (this.currentSource === 'websocket') {
        // WebSocket模式下使用模拟数据
        return this.getSimulatedKlineData(symbol);
      } else {
        // API模式下获取真实数据
        return await cryptoAPI.getKlineData(symbol, interval);
      }
    } catch (error) {
      console.error('获取K线数据失败:', error);
      return this.getSimulatedKlineData(symbol);
    }
  }

  // 获取订单簿数据
  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      if (this.currentSource === 'websocket') {
        // WebSocket模式下使用模拟数据
        return this.getSimulatedOrderBook(symbol);
      } else {
        // API模式下获取真实数据
        return await cryptoAPI.getOrderBook(symbol);
      }
    } catch (error) {
      console.error('获取订单簿失败:', error);
      return this.getSimulatedOrderBook(symbol);
    }
  }

  // 订阅币种数据
  subscribe(symbol: string) {
    if (this.currentSource === 'websocket') {
      this.wsService.subscribe(symbol);
    }
    // API模式下不需要订阅，通过轮询获取数据
  }

  // 取消订阅
  unsubscribe(symbol: string) {
    if (this.currentSource === 'websocket') {
      this.wsService.unsubscribe(symbol);
    }
  }

  // 事件监听
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // 移除事件监听
  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // 获取当前数据源
  getCurrentSource(): DataSource {
    return this.currentSource;
  }

  // 手动切换数据源
  switchSource(source: DataSource) {
    if (source !== this.currentSource) {
      this.currentSource = source;
      this.emit('sourceChanged', source);
      
      if (source === 'websocket') {
        this.wsService.connect();
      } else if (source === 'api') {
        this.startAPIPolling();
      }
    }
  }

  // 获取当前选中的币种（需要从Redux store获取）
  private getCurrentSymbol(): string {
    // 这里应该从Redux store获取当前选中的币种
    // 暂时返回默认值
    return 'BTCUSDT';
  }

  // 模拟数据生成方法
  private getSimulatedCoinList(): CoinData[] {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT'];
    return symbols.map((symbol, index) => {
      const basePrice = [45000, 3000, 300, 0.5, 0.6, 100, 25, 0.08][index];
      const change = (Math.random() - 0.5) * 10;
      return {
        symbol,
        name: symbol.replace('USDT', ''),
        price: basePrice * (1 + change / 100),
        change24h: change,
        volume24h: Math.random() * 1000000,
        marketCap: basePrice * Math.random() * 1000000,
        high24h: basePrice * 1.05,
        low24h: basePrice * 0.95,
        icon: `https://cryptoicons.org/api/icon/${symbol.replace('USDT', '').toLowerCase()}/32`,
        isFavorite: false,
        category: this.getCoinCategory(symbol)
      };
    });
  }

  private getSimulatedKlineData(symbol: string): KlineData[] {
    const data: KlineData[] = [];
    const basePrice = symbol === 'BTCUSDT' ? 45000 : 3000;
    let currentPrice = basePrice;
    const now = Date.now();

    for (let i = 99; i >= 0; i--) {
      const change = (Math.random() - 0.5) * 0.02;
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);

      data.push({
        time: (now - i * 60000) / 1000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 100
      });

      currentPrice = close;
    }

    return data;
  }

  private getSimulatedOrderBook(symbol: string): OrderBookData {
    const basePrice = symbol === 'BTCUSDT' ? 45000 : 3000;
    const bids = [];
    const asks = [];

    for (let i = 0; i < 10; i++) {
      bids.push({
        price: basePrice * (1 - (i + 1) * 0.0001),
        quantity: Math.random() * 10
      });
      asks.push({
        price: basePrice * (1 + (i + 1) * 0.0001),
        quantity: Math.random() * 10
      });
    }

    return {
      symbol,
      bids,
      asks,
      timestamp: Date.now()
    };
  }

  private getCoinCategory(symbol: string): string {
    const categories: { [key: string]: string } = {
      'BTCUSDT': '主流币',
      'ETHUSDT': '主流币',
      'BNBUSDT': '主流币',
      'ADAUSDT': 'DeFi',
      'XRPUSDT': '支付',
      'SOLUSDT': '公链',
      'DOTUSDT': '公链',
      'DOGEUSDT': 'Meme'
    };
    return categories[symbol] || '其他';
  }
}

// 导出单例实例
export const dataManager = DataManager.getInstance();