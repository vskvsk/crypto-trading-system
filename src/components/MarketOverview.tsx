import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { theme } from '../styles/theme';

// 市场概览组件
const MarketOverview: React.FC = () => {
  const { cryptoList, wsConnected } = useAppSelector(state => state.market);
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    totalVolume24h: 0,
    gainersCount: 0,
    losersCount: 0,
    avgChange: 0
  });

  // 计算市场统计数据
  useEffect(() => {
    if (cryptoList.length > 0) {
      const totalMarketCap = cryptoList.reduce((sum, crypto) => sum + crypto.marketCap, 0);
      const totalVolume24h = cryptoList.reduce((sum, crypto) => sum + crypto.volume24h, 0);
      const gainersCount = cryptoList.filter(crypto => crypto.changePercent24h > 0).length;
      const losersCount = cryptoList.filter(crypto => crypto.changePercent24h < 0).length;
      const avgChange = cryptoList.reduce((sum, crypto) => sum + crypto.changePercent24h, 0) / cryptoList.length;

      setMarketStats({
        totalMarketCap,
        totalVolume24h,
        gainersCount,
        losersCount,
        avgChange
      });
    }
  }, [cryptoList]);

  // 格式化大数字
  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  // 获取市场情绪
  const getMarketSentiment = () => {
    if (marketStats.avgChange > 2) return { text: '极度贪婪', color: theme.colors.success };
    if (marketStats.avgChange > 0.5) return { text: '贪婪', color: theme.colors.success };
    if (marketStats.avgChange > -0.5) return { text: '中性', color: theme.colors.text.secondary };
    if (marketStats.avgChange > -2) return { text: '恐惧', color: theme.colors.danger };
    return { text: '极度恐惧', color: theme.colors.danger };
  };

  const sentiment = getMarketSentiment();

  return (
    <div style={{
      background: theme.colors.background.secondary,
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: `1px solid ${theme.colors.border.primary}`
    }}>
      {/* 顶部滚动行情 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        marginBottom: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        paddingBottom: '8px'
      }}>
        {cryptoList.slice(0, 8).map(crypto => (
          <div key={crypto.symbol} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '120px'
          }}>
            <span style={{
              fontSize: '12px',
              color: theme.colors.text.secondary,
              fontWeight: '500'
            }}>
              {crypto.symbol.replace('USDT', '')}
            </span>
            <span className="mono-font" style={{
              fontSize: '13px',
              color: theme.colors.text.primary,
              fontWeight: 'bold'
            }}>
              ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toFixed(2)}
            </span>
            <span className={crypto.changePercent24h >= 0 ? 'price-up' : 'price-down'} style={{
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {crypto.changePercent24h >= 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* 市场统计 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* 总市值 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            总市值
          </div>
          <div className="mono-font" style={{
            fontSize: '14px',
            color: theme.colors.text.primary,
            fontWeight: 'bold'
          }}>
            ${formatLargeNumber(marketStats.totalMarketCap)}
          </div>
        </div>

        {/* 24h成交量 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            24h成交量
          </div>
          <div className="mono-font" style={{
            fontSize: '14px',
            color: theme.colors.text.primary,
            fontWeight: 'bold'
          }}>
            ${formatLargeNumber(marketStats.totalVolume24h)}
          </div>
        </div>

        {/* 涨跌统计 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            涨跌统计
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="price-up" style={{ fontSize: '12px', fontWeight: '500' }}>
              ↑{marketStats.gainersCount}
            </span>
            <span className="price-down" style={{ fontSize: '12px', fontWeight: '500' }}>
              ↓{marketStats.losersCount}
            </span>
          </div>
        </div>

        {/* 市场情绪 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            市场情绪
          </div>
          <div style={{
            fontSize: '12px',
            color: sentiment.color,
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{sentiment.text}</span>
            <span className="mono-font">
              ({marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* 连接状态 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            数据状态
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: wsConnected ? theme.colors.success : theme.colors.danger,
              animation: wsConnected ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: '12px',
              color: wsConnected ? theme.colors.success : theme.colors.danger,
              fontWeight: '500'
            }}>
              {wsConnected ? '实时' : '离线'}
            </span>
          </div>
        </div>

        {/* 更新时间 */}
        <div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary,
            marginBottom: '4px'
          }}>
            更新时间
          </div>
          <div style={{
            fontSize: '11px',
            color: theme.colors.text.secondary
          }}>
            {new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;