import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { websocketService } from '../services/websocket';
import { setSelectedSymbol } from '../store/slices/marketSlice';

// WebSocket连接管理Hook
export const useWebSocket = () => {
  const dispatch = useAppDispatch();
  const { selectedSymbol, wsConnected } = useAppSelector(state => state.market);

  // 初始化WebSocket连接
  useEffect(() => {
    console.log('初始化WebSocket连接...');
    websocketService.connect();

    // 组件卸载时断开连接
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // 当选中的币种改变时，更新订阅
  useEffect(() => {
    if (wsConnected && selectedSymbol) {
      console.log(`切换到币种: ${selectedSymbol}`);
      websocketService.subscribe(selectedSymbol);
    }
  }, [selectedSymbol, wsConnected]);

  // 切换币种的方法
  const switchSymbol = useCallback((symbol: string) => {
    dispatch(setSelectedSymbol(symbol));
  }, [dispatch]);

  return {
    isConnected: wsConnected,
    selectedSymbol,
    switchSymbol,
    subscribedSymbols: websocketService.getSubscribedSymbols(),
  };
};

// 实时数据Hook
export const useRealTimeData = (symbol?: string) => {
  const { cryptoList, klineData } = useAppSelector(state => state.market);
  const { orderBook, recentTrades } = useAppSelector(state => state.trading);

  const targetSymbol = symbol || useAppSelector(state => state.market.selectedSymbol);

  // 获取指定币种的数据
  const cryptoData = cryptoList.find(crypto => crypto.symbol === targetSymbol);
  const klineDataForSymbol = klineData[targetSymbol] || [];

  return {
    cryptoData,
    klineData: klineDataForSymbol,
    orderBook,
    recentTrades,
    isDataAvailable: !!cryptoData,
  };
};

// 价格变化监听Hook
export const usePriceChange = (symbol: string, callback?: (data: any) => void) => {
  const cryptoData = useAppSelector(state => 
    state.market.cryptoList.find(crypto => crypto.symbol === symbol)
  );

  useEffect(() => {
    if (cryptoData && callback) {
      callback(cryptoData);
    }
  }, [cryptoData, callback]);

  return cryptoData;
};

// 连接状态监听Hook
export const useConnectionStatus = () => {
  const { wsConnected, error } = useAppSelector(state => state.market);

  return {
    isConnected: wsConnected,
    error,
    status: wsConnected ? 'connected' : 'disconnected',
  };
};