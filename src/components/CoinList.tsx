import React, { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { setSelectedSymbol } from '../store/slices/marketSlice';
import { useRealTimeData } from '../hooks/useWebSocket';
import CoinFilter, { type FilterOptions } from './CoinFilter';
import { theme } from '../styles/theme';

const CoinList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedSymbol, favorites, cryptoList } = useAppSelector(state => state.market);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    sortBy: 'marketCap',
    sortOrder: 'desc',
    priceRange: [0, 100000]
  });

  // 使用实时数据，如果没有数据则使用模拟数据
  const displayCoins = cryptoList.length > 0 ? cryptoList : [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 43250.50, changePercent24h: 2.45, volume24h: 1234567890, change24h: 1056.75, marketCap: 850000000000, lastUpdate: Date.now() },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: 2650.75, changePercent24h: -1.23, volume24h: 987654321, change24h: -33.25, marketCap: 320000000000, lastUpdate: Date.now() },
    { symbol: 'BNBUSDT', name: 'BNB', price: 315.20, changePercent24h: 3.67, volume24h: 456789123, change24h: 11.15, marketCap: 48000000000, lastUpdate: Date.now() },
    { symbol: 'ADAUSDT', name: 'Cardano', price: 0.485, changePercent24h: -0.89, volume24h: 234567890, change24h: -0.0043, marketCap: 17000000000, lastUpdate: Date.now() },
    { symbol: 'SOLUSDT', name: 'Solana', price: 98.45, changePercent24h: 5.23, volume24h: 345678901, change24h: 4.89, marketCap: 42000000000, lastUpdate: Date.now() },
    { symbol: 'XRPUSDT', name: 'XRP', price: 0.625, changePercent24h: 1.45, volume24h: 567890123, change24h: 0.009, marketCap: 34000000000, lastUpdate: Date.now() },
    { symbol: 'DOTUSDT', name: 'Polkadot', price: 7.85, changePercent24h: -2.15, volume24h: 123456789, change24h: -0.17, marketCap: 9500000000, lastUpdate: Date.now() },
    { symbol: 'AVAXUSDT', name: 'Avalanche', price: 36.75, changePercent24h: 4.32, volume24h: 678901234, change24h: 1.52, marketCap: 13500000000, lastUpdate: Date.now() },
  ];

  // 应用筛选和排序
  const filteredCoins = useMemo(() => {
    let result = displayCoins.filter(coin => {
      // 搜索筛选
      const matchesSearch = !filters.search || 
        coin.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(filters.search.toLowerCase());
      
      // 分类筛选
      let matchesCategory = true;
      switch (filters.category) {
        case 'favorites':
          matchesCategory = favorites.includes(coin.symbol);
          break;
        case 'gainers':
          matchesCategory = coin.changePercent24h > 0;
          break;
        case 'losers':
          matchesCategory = coin.changePercent24h < 0;
          break;
        case 'volume':
          matchesCategory = coin.volume24h > 100000000;
          break;
        default:
          matchesCategory = true;
      }
      
      // 价格区间筛选
      const matchesPrice = coin.price >= filters.priceRange[0] && coin.price <= filters.priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // 排序
    result.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.changePercent24h;
          bValue = b.changePercent24h;
          break;
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'marketCap':
        default:
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
      }
      
      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return result;
  }, [displayCoins, filters, favorites]);

  const handleCoinSelect = (symbol: string) => {
    dispatch(setSelectedSymbol(symbol));
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(1) + 'B';
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(1) + 'M';
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(1) + 'K';
    }
    return volume.toString();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 0 16px' }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '16px', fontSize: '16px' }}>
          市场行情
        </h3>
      </div>
      
      {/* 筛选组件 */}
      <div style={{ padding: '0 16px' }}>
        <CoinFilter onFilterChange={setFilters} />
      </div>
      
      {/* 表头 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 60px',
        gap: '8px',
        padding: '8px 12px',
        background: theme.colors.background.secondary,
        borderRadius: '4px',
        marginBottom: '8px',
        fontSize: '12px',
        color: theme.colors.text.secondary,
        fontWeight: '500'
      }}>
        <div>币种</div>
        <div style={{ textAlign: 'right' }}>价格</div>
        <div style={{ textAlign: 'right' }}>涨跌</div>
      </div>
      
      {/* 币种列表 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '0 16px 16px 16px'
      }}>
        {filteredCoins.map(coin => (
          <div 
            key={coin.symbol}
            onClick={() => handleCoinSelect(coin.symbol)}
            style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 80px 60px',
              gap: '8px',
              padding: '12px',
              marginBottom: '4px',
              cursor: 'pointer',
              borderRadius: '6px',
              background: selectedSymbol === coin.symbol ? theme.colors.background.hover : theme.colors.background.card,
              border: `1px solid ${selectedSymbol === coin.symbol ? theme.colors.primary.main : theme.colors.border.secondary}`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedSymbol !== coin.symbol) {
                e.currentTarget.style.background = theme.colors.background.hover;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedSymbol !== coin.symbol) {
                e.currentTarget.style.background = theme.colors.background.card;
              }
            }}
          >
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                color: theme.colors.text.primary,
                fontSize: '14px',
                marginBottom: '2px'
              }}>
                {coin.symbol.replace('USDT', '')}/USDT
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: theme.colors.text.secondary 
              }}>
                {coin.name}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div className="mono-font" style={{ 
                fontWeight: 'bold',
                color: theme.colors.text.primary,
                fontSize: '13px'
              }}>
                ${formatPrice(coin.price)}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: theme.colors.text.secondary 
              }}>
                {formatVolume(coin.volume24h)}
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div 
                className={coin.changePercent24h >= 0 ? 'price-up' : 'price-down'}
                style={{ 
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                {coin.changePercent24h >= 0 ? '+' : ''}{coin.changePercent24h.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCoins.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: theme.colors.text.secondary,
          padding: '32px 16px',
          fontSize: '14px'
        }}>
          未找到匹配的币种
        </div>
      )}
    </div>
  );
};

export default CoinList;