import { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { dataManager, type DataSource } from '../services/dataManager';
import { updateCryptoData, updateKlineData, setError } from '../store/slices/marketSlice';
import { updateOrderBook, updateRecentTrades } from '../store/slices/tradingSlice';
import type { CryptoData, KlineData, OrderBookData, TradeData } from '../types';

// 数据管理器Hook
export const useDataManager = () => {
  const dispatch = useAppDispatch();
  const { selectedSymbol } = useAppSelector(state => state.market);
  const [currentSource, setCurrentSource] = useState<DataSource>('websocket');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据管理器
  useEffect(() => {
    console.log('初始化数据管理器...');

    // 监听数据源变化
    dataManager.on('sourceChanged', (source: DataSource) => {
      console.log(`数据源切换到: ${source}`);
      setCurrentSource(source);
      setIsConnected(source !== 'fallback');
      setError(null);
    });

    // 监听价格更新
    dataManager.on('priceUpdate', (data: CryptoData) => {
      dispatch(updateCryptoData(data));
    });

    // 监听K线数据更新
    dataManager.on('klineUpdate', (data: { symbol: string; data: KlineData[] }) => {
      dispatch(updateKlineData(data));
    });

    // 监听订单簿更新
    dataManager.on('orderBookUpdate', (data: OrderBookData) => {
      dispatch(updateOrderBook(data));
    });

    // 监听成交记录更新
    dataManager.on('tradeUpdate', (data: TradeData[]) => {
      dispatch(updateRecentTrades(data));
    });

    // 监听币种列表更新
    dataManager.on('coinListUpdate', (data: CryptoData[]) => {
      dispatch(updateCryptoList(data));
    });

    // 初始加载币种列表
    loadCoinList();

    return () => {
      // 清理监听器
      dataManager.off('sourceChanged', () => {});
      dataManager.off('priceUpdate', () => {});
      dataManager.off('klineUpdate', () => {});
      dataManager.off('orderBookUpdate', () => {});
      dataManager.off('tradeUpdate', () => {});
      dataManager.off('coinListUpdate', () => {});
    };
  }, [dispatch]);

  // 当选中币种变化时，订阅新数据
  useEffect(() => {
    if (selectedSymbol) {
      console.log(`订阅币种数据: ${selectedSymbol}`);
      dataManager.subscribe(selectedSymbol);
      
      // 立即获取该币种的初始数据
      loadSymbolData(selectedSymbol);
    }
  }, [selectedSymbol]);

  // 加载币种列表
  const loadCoinList = useCallback(async () => {
    try {
      const coinList = await dataManager.getCoinList();
      dispatch(updateCryptoList(coinList));
    } catch (error) {
      console.error('加载币种列表失败:', error);
      dispatch(setError('加载币种列表失败'));
    }
  }, [dispatch]);

  // 加载指定币种的数据
  const loadSymbolData = useCallback(async (symbol: string) => {
    try {
      // 并行加载多种数据
      const [klineData, orderBook] = await Promise.all([
        dataManager.getKlineData(symbol),
        dataManager.getOrderBook(symbol)
      ]);

      // 更新Redux状态
      dispatch(updateKlineData({ symbol, data: klineData }));
      dispatch(updateOrderBook(orderBook));
    } catch (error) {
      console.error(`加载${symbol}数据失败:`, error);
      dispatch(setError(`加载${symbol}数据失败`));
    }
  }, [dispatch]);

  // 手动切换数据源
  const switchDataSource = useCallback((source: DataSource) => {
    dataManager.switchSource(source);
  }, []);

  // 刷新数据
  const refreshData = useCallback(() => {
    loadCoinList();
    if (selectedSymbol) {
      loadSymbolData(selectedSymbol);
    }
  }, [loadCoinList, loadSymbolData, selectedSymbol]);

  return {
    currentSource,
    isConnected,
    error,
    switchDataSource,
    refreshData,
    loadSymbolData,
  };
};

// 增强版实时数据Hook
export const useEnhancedRealTimeData = (symbol?: string) => {
  const { cryptoList, klineData } = useAppSelector(state => state.market);
  const { orderBook, recentTrades } = useAppSelector(state => state.trading);
  const targetSymbol = symbol || useAppSelector(state => state.market.selectedSymbol);

  // 获取指定币种的数据
  const cryptoData = cryptoList.find(crypto => crypto.symbol === targetSymbol);
  const klineDataForSymbol = klineData[targetSymbol] || [];

  // 数据质量检查
  const dataQuality = {
    hasPriceData: !!cryptoData,
    hasKlineData: klineDataForSymbol.length > 0,
    hasOrderBook: orderBook.bids.length > 0 && orderBook.asks.length > 0,
    hasTrades: recentTrades.length > 0,
    lastUpdate: cryptoData ? Date.now() : null,
  };

  return {
    cryptoData,
    klineData: klineDataForSymbol,
    orderBook,
    recentTrades,
    dataQuality,
    isDataAvailable: dataQuality.hasPriceData,
  };
};

// 数据源状态Hook
export const useDataSourceStatus = () => {
  const [status, setStatus] = useState({
    currentSource: dataManager.getCurrentSource(),
    isHealthy: true,
    lastCheck: Date.now(),
    errorCount: 0,
  });

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const currentSource = dataManager.getCurrentSource();
      setStatus(prev => ({
        ...prev,
        currentSource,
        lastCheck: Date.now(),
      }));
    }, 5000);

    // 监听数据源变化
    dataManager.on('sourceChanged', (source: DataSource) => {
      setStatus(prev => ({
        ...prev,
        currentSource: source,
        isHealthy: source !== 'fallback',
        errorCount: source === 'fallback' ? prev.errorCount + 1 : 0,
      }));
    });

    return () => {
      clearInterval(checkInterval);
      dataManager.off('sourceChanged', () => {});
    };
  }, []);

  return status;
};

// 数据缓存Hook
export const useDataCache = () => {
  const [cache, setCache] = useState<{ [key: string]: any }>({});

  const getCachedData = useCallback((key: string) => {
    return cache[key];
  }, [cache]);

  const setCachedData = useCallback((key: string, data: any) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      }
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const isCacheValid = useCallback((key: string, maxAge: number = 30000) => {
    const cached = cache[key];
    if (!cached) return false;
    return Date.now() - cached.timestamp < maxAge;
  }, [cache]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isCacheValid,
  };
};