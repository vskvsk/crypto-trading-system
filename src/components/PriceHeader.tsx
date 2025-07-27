import React from 'react';
import { useAppSelector } from '../store';
import { theme } from '../styles/theme';

// 模拟价格数据
const mockPriceData: Record<string, any> = {
  'BTCUSDT': {
    price: 43250.50,
    change24h: 1056.75,
    changePercent24h: 2.45,
    high24h: 44100.00,
    low24h: 42800.00,
    volume24h: 1234567890,
  },
  'ETHUSDT': {
    price: 2650.75,
    change24h: -33.25,
    changePercent24h: -1.23,
    high24h: 2720.00,
    low24h: 2580.00,
    volume24h: 987654321,
  },
  'BNBUSDT': {
    price: 315.20,
    change24h: 11.15,
    changePercent24h: 3.67,
    high24h: 325.50,
    low24h: 308.00,
    volume24h: 456789123,
  },
  'ADAUSDT': {
    price: 0.485,
    change24h: -0.0043,
    changePercent24h: -0.89,
    high24h: 0.495,
    low24h: 0.478,
    volume24h: 234567890,
  },
  'SOLUSDT': {
    price: 98.45,
    change24h: 4.89,
    changePercent24h: 5.23,
    high24h: 102.30,
    low24h: 94.20,
    volume24h: 345678901,
  },
};

const PriceHeader: React.FC = () => {
  const { selectedSymbol } = useAppSelector(state => state.market);
  const priceData = mockPriceData[selectedSymbol] || mockPriceData['BTCUSDT'];

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(2) + 'B';
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + 'M';
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + 'K';
    }
    return volume.toString();
  };

  const isPositive = priceData.changePercent24h >= 0;

  return (
    <div style={{ 
      background: theme.colors.background.secondary, 
      padding: '16px 20px', 
      borderRadius: '8px',
      marginBottom: '16px',
      border: `1px solid ${theme.colors.border.primary}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        {/* 币种名称 */}
        <div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: theme.colors.text.primary,
            marginBottom: '4px'
          }}>
            {selectedSymbol.replace('USDT', '')}/USDT
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary 
          }}>
            {selectedSymbol.replace('USDT', '')}
          </div>
        </div>

        {/* 当前价格 */}
        <div>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>
            当前价格
          </div>
          <div className="mono-font" style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: theme.colors.text.primary,
            lineHeight: '1'
          }}>
            ${formatPrice(priceData.price)}
          </div>
        </div>

        {/* 24h涨跌 */}
        <div>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>
            24h涨跌
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              className={`mono-font ${isPositive ? 'price-up' : 'price-down'}`}
              style={{ 
                fontSize: '18px', 
                fontWeight: 'bold'
              }}
            >
              {isPositive ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
            </div>
            <div 
              className={`mono-font ${isPositive ? 'price-up' : 'price-down'}`}
              style={{ fontSize: '14px' }}
            >
              {isPositive ? '+' : ''}${Math.abs(priceData.change24h).toFixed(2)}
            </div>
          </div>
        </div>

        {/* 24h最高 */}
        <div>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>
            24h最高
          </div>
          <div className="mono-font" style={{ 
            fontSize: '16px', 
            color: theme.colors.text.primary,
            fontWeight: '500'
          }}>
            ${formatPrice(priceData.high24h)}
          </div>
        </div>

        {/* 24h最低 */}
        <div>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>
            24h最低
          </div>
          <div className="mono-font" style={{ 
            fontSize: '16px', 
            color: theme.colors.text.primary,
            fontWeight: '500'
          }}>
            ${formatPrice(priceData.low24h)}
          </div>
        </div>

        {/* 24h成交量 */}
        <div>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>
            24h成交量
          </div>
          <div className="mono-font" style={{ 
            fontSize: '16px', 
            color: theme.colors.text.primary,
            fontWeight: '500'
          }}>
            {formatVolume(priceData.volume24h)}
          </div>
        </div>

        {/* 实时状态指示器 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: theme.colors.success,
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary 
          }}>
            实时数据
          </span>
        </div>
      </div>

      {/* 添加脉冲动画的CSS */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default PriceHeader;