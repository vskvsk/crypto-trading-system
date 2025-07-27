import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { 
  updateCryptoData, 
  addKlineData, 
  setWsConnected, 
  setError 
} from '../store/slices/marketSlice';
import { 
  updateOrderBook, 
  addRecentTrade 
} from '../store/slices/tradingSlice';
import type { CryptoData, KlineData, WSMessage } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribedSymbols: Set<string> = new Set();

  // 连接WebSocket
  connect() {
    try {
      // 由于这是演示项目，我们使用模拟的WebSocket连接
      // 在实际项目中，这里应该连接到真实的加密货币交易所API
      console.log('正在连接WebSocket...');
      
      // 模拟连接成功
      setTimeout(() => {
        store.dispatch(setWsConnected(true));
        console.log('WebSocket连接成功');
        this.startMockDataStream();
      }, 1000);

    } catch (error) {
      console.error('WebSocket连接失败:', error);
      store.dispatch(setError('WebSocket连接失败'));
      this.handleReconnect();
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    store.dispatch(setWsConnected(false));
    console.log('WebSocket已断开连接');
  }

  // 订阅币种数据
  subscribe(symbol: string) {
    this.subscribedSymbols.add(symbol);
    console.log(`订阅币种: ${symbol}`);
    
    // 在真实环境中，这里会发送订阅消息到WebSocket服务器
    // this.socket?.emit('subscribe', { symbol, channels: ['ticker', 'kline', 'depth'] });
  }

  // 取消订阅
  unsubscribe(symbol: string) {
    this.subscribedSymbols.delete(symbol);
    console.log(`取消订阅币种: ${symbol}`);
    
    // 在真实环境中，这里会发送取消订阅消息
    // this.socket?.emit('unsubscribe', { symbol });
  }

  // 处理重连
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('WebSocket重连失败，已达到最大重试次数');
      store.dispatch(setError('WebSocket连接失败，请刷新页面重试'));
    }
  }

  // 模拟数据流（在实际项目中替换为真实的WebSocket数据处理）
  private startMockDataStream() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'AVAXUSDT'];
    
    // 初始价格数据
    const basePrices: Record<string, number> = {
      'BTCUSDT': 43250.50,
      'ETHUSDT': 2650.75,
      'BNBUSDT': 315.20,
      'ADAUSDT': 0.485,
      'SOLUSDT': 98.45,
      'XRPUSDT': 0.625,
      'DOTUSDT': 7.85,
      'AVAXUSDT': 36.75,
    };

    // 模拟实时价格更新
    const priceUpdateInterval = setInterval(() => {
      symbols.forEach(symbol => {
        const basePrice = basePrices[symbol];
        const changePercent = (Math.random() - 0.5) * 0.02; // ±1%的随机变化
        const newPrice = basePrice * (1 + changePercent);
        const change24h = newPrice - basePrice;
        const changePercent24h = (change24h / basePrice) * 100;

        const cryptoData: CryptoData = {
          symbol,
          name: symbol.replace('USDT', ''),
          price: newPrice,
          change24h,
          changePercent24h,
          volume24h: Math.random() * 1000000000,
          marketCap: newPrice * Math.random() * 100000000,
          lastUpdate: Date.now(),
        };

        store.dispatch(updateCryptoData(cryptoData));

        // 更新基础价格（缓慢漂移）
        basePrices[symbol] = newPrice;
      });
    }, 2000); // 每2秒更新一次价格

    // 模拟K线数据更新
    const klineUpdateInterval = setInterval(() => {
      const currentSymbol = store.getState().market.selectedSymbol;
      if (this.subscribedSymbols.has(currentSymbol) || currentSymbol) {
        const basePrice = basePrices[currentSymbol] || basePrices['BTCUSDT'];
        const now = Math.floor(Date.now() / 1000);
        
        // 生成新的K线数据点
        const open = basePrice;
        const changePercent = (Math.random() - 0.5) * 0.01;
        const close = open * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        const volume = Math.random() * 1000000;

        const klineData: KlineData = {
          time: now,
          open,
          high,
          low,
          close,
          volume,
        };

        store.dispatch(addKlineData({ symbol: currentSymbol, data: klineData }));
      }
    }, 5000); // 每5秒更新一次K线

    // 模拟订单簿数据
    const orderBookInterval = setInterval(() => {
      const currentSymbol = store.getState().market.selectedSymbol;
      const basePrice = basePrices[currentSymbol] || basePrices['BTCUSDT'];
      
      // 生成买单和卖单
      const bids: Array<[number, number]> = [];
      const asks: Array<[number, number]> = [];
      
      for (let i = 0; i < 10; i++) {
        // 买单（价格低于当前价格）
        const bidPrice = basePrice * (1 - (i + 1) * 0.001);
        const bidQuantity = Math.random() * 10;
        bids.push([bidPrice, bidQuantity]);
        
        // 卖单（价格高于当前价格）
        const askPrice = basePrice * (1 + (i + 1) * 0.001);
        const askQuantity = Math.random() * 10;
        asks.push([askPrice, askQuantity]);
      }
      
      store.dispatch(updateOrderBook({ bids, asks }));
    }, 3000); // 每3秒更新订单簿

    // 模拟最新成交
    const tradesInterval = setInterval(() => {
      const currentSymbol = store.getState().market.selectedSymbol;
      const basePrice = basePrices[currentSymbol] || basePrices['BTCUSDT'];
      
      const trade = {
        price: basePrice * (1 + (Math.random() - 0.5) * 0.002),
        quantity: Math.random() * 5,
        time: Date.now(),
        side: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
      };
      
      store.dispatch(addRecentTrade(trade));
    }, 1500); // 每1.5秒添加新成交

    // 清理函数
    return () => {
      clearInterval(priceUpdateInterval);
      clearInterval(klineUpdateInterval);
      clearInterval(orderBookInterval);
      clearInterval(tradesInterval);
    };
  }

  // 获取连接状态
  isConnected(): boolean {
    return store.getState().market.wsConnected;
  }

  // 获取已订阅的币种
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }
}

// 创建单例实例
export const websocketService = new WebSocketService();

// 导出类型
export default WebSocketService;