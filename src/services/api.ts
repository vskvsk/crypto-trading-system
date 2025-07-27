import axios from 'axios';
import type { CryptoData, KlineData, OrderBookData, TradeData } from '../types';

// 创建axios实例
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API错误:', error);
    return Promise.reject(error);
  }
);

// API接口类
export class CryptoAPI {
  private static instance: CryptoAPI;
  private baseURL = 'https://api.binance.com/api/v3';
  private fallbackData: { [key: string]: any } = {};

  static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI();
    }
    return CryptoAPI.instance;
  }

  // 获取币种列表和价格信息
  async getCoinList(): Promise<CoinData[]> {
    try {
      const response = await api.get(`${this.baseURL}/ticker/24hr`);
      const data = response.data;
      
      // 转换为我们的数据格式
      const coinList: CoinData[] = data
        .filter((item: any) => item.symbol.endsWith('USDT'))
        .slice(0, 50) // 只取前50个
        .map((item: any) => ({
          symbol: item.symbol,
          name: item.symbol.replace('USDT', ''),
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent),
          volume24h: parseFloat(item.volume),
          marketCap: parseFloat(item.lastPrice) * parseFloat(item.volume), // 简化计算
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
          icon: `https://cryptoicons.org/api/icon/${item.symbol.replace('USDT', '').toLowerCase()}/32`,
          isFavorite: false,
          category: this.getCoinCategory(item.symbol)
        }));

      this.fallbackData.coinList = coinList;
      return coinList;
    } catch (error) {
      console.error('获取币种列表失败，使用备用数据:', error);
      return this.getFallbackCoinList();
    }
  }

  // 获取K线数据
  async getKlineData(symbol: string, interval: string = '1m', limit: number = 100): Promise<KlineData[]> {
    try {
      const response = await api.get(`${this.baseURL}/klines`, {
        params: {
          symbol: symbol,
          interval: interval,
          limit: limit
        }
      });

      const klineData: KlineData[] = response.data.map((item: any[]) => ({
        time: item[0] / 1000, // 转换为秒
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));

      this.fallbackData[`kline_${symbol}`] = klineData;
      return klineData;
    } catch (error) {
      console.error('获取K线数据失败，使用备用数据:', error);
      return this.getFallbackKlineData(symbol);
    }
  }

  // 获取订单簿数据
  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBookData> {
    try {
      const response = await api.get(`${this.baseURL}/depth`, {
        params: {
          symbol: symbol,
          limit: limit
        }
      });

      const orderBook: OrderBookData = {
        symbol: symbol,
        bids: response.data.bids.map((item: string[]) => ({
          price: parseFloat(item[0]),
          quantity: parseFloat(item[1])
        })),
        asks: response.data.asks.map((item: string[]) => ({
          price: parseFloat(item[0]),
          quantity: parseFloat(item[1])
        })),
        timestamp: Date.now()
      };

      this.fallbackData[`orderbook_${symbol}`] = orderBook;
      return orderBook;
    } catch (error) {
      console.error('获取订单簿失败，使用备用数据:', error);
      return this.getFallbackOrderBook(symbol);
    }
  }

  // 获取最新成交记录
  async getRecentTrades(symbol: string, limit: number = 50): Promise<TradeData[]> {
    try {
      const response = await api.get(`${this.baseURL}/trades`, {
        params: {
          symbol: symbol,
          limit: limit
        }
      });

      const trades: TradeData[] = response.data.map((item: any) => ({
        id: item.id.toString(),
        price: parseFloat(item.price),
        quantity: parseFloat(item.qty),
        timestamp: item.time,
        isBuyerMaker: item.isBuyerMaker,
        side: item.isBuyerMaker ? 'sell' : 'buy'
      }));

      this.fallbackData[`trades_${symbol}`] = trades;
      return trades;
    } catch (error) {
      console.error('获取成交记录失败，使用备用数据:', error);
      return this.getFallbackTrades(symbol);
    }
  }

  // 获取单个币种价格
  async getPrice(symbol: string): Promise<number> {
    try {
      const response = await api.get(`${this.baseURL}/ticker/price`, {
        params: { symbol }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('获取价格失败:', error);
      return this.getFallbackPrice(symbol);
    }
  }

  // 备用数据生成方法
  private getFallbackCoinList(): CoinData[] {
    if (this.fallbackData.coinList) {
      return this.fallbackData.coinList;
    }

    // 生成模拟数据
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

  private getFallbackKlineData(symbol: string): KlineData[] {
    const cached = this.fallbackData[`kline_${symbol}`];
    if (cached) return cached;

    // 生成模拟K线数据
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

  private getFallbackOrderBook(symbol: string): OrderBookData {
    const cached = this.fallbackData[`orderbook_${symbol}`];
    if (cached) return cached;

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

  private getFallbackTrades(symbol: string): TradeData[] {
    const cached = this.fallbackData[`trades_${symbol}`];
    if (cached) return cached;

    const trades: TradeData[] = [];
    const basePrice = symbol === 'BTCUSDT' ? 45000 : 3000;
    const now = Date.now();

    for (let i = 0; i < 20; i++) {
      trades.push({
        id: (now + i).toString(),
        price: basePrice * (1 + (Math.random() - 0.5) * 0.001),
        quantity: Math.random() * 5,
        timestamp: now - i * 1000,
        isBuyerMaker: Math.random() > 0.5,
        side: Math.random() > 0.5 ? 'buy' : 'sell'
      });
    }

    return trades;
  }

  private getFallbackPrice(symbol: string): number {
    return symbol === 'BTCUSDT' ? 45000 : 3000;
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
export const cryptoAPI = CryptoAPI.getInstance();