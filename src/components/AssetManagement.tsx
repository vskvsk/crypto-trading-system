import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { theme } from '../styles/theme';

// 资产数据类型
interface AssetData {
  symbol: string;
  name: string;
  balance: number;
  frozen: number;
  available: number;
  usdValue: number;
  avgPrice: number;
  pnl: number;
  pnlPercent: number;
}

// 交易记录类型
interface TradeRecord {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  total: number;
  timestamp: number;
  status: 'completed' | 'cancelled';
}

const AssetManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector(state => state.trading);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview');
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  // 模拟资产数据
  const [totalBalance, setTotalBalance] = useState(125847.32);
  const [todayPnL, setTodayPnL] = useState(2847.65);
  const [todayPnLPercent, setTodayPnLPercent] = useState(2.31);

  // 模拟持仓数据
  const [positions, setPositions] = useState<AssetData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 2.45678,
      frozen: 0.1,
      available: 2.35678,
      usdValue: 98234.56,
      avgPrice: 39987.23,
      pnl: 12456.78,
      pnlPercent: 14.52
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 15.8934,
      frozen: 0,
      available: 15.8934,
      usdValue: 45678.90,
      avgPrice: 2876.45,
      pnl: -2345.67,
      pnlPercent: -4.89
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      balance: 25000.00,
      frozen: 5000.00,
      available: 20000.00,
      usdValue: 25000.00,
      avgPrice: 1.00,
      pnl: 0,
      pnlPercent: 0
    }
  ]);

  // 模拟交易记录
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>([
    {
      id: '1',
      symbol: 'BTCUSDT',
      side: 'buy',
      quantity: 0.5,
      price: 42000,
      fee: 21.00,
      total: 21000,
      timestamp: Date.now() - 3600000,
      status: 'completed'
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      side: 'sell',
      quantity: 2.0,
      price: 2800,
      fee: 5.60,
      total: 5600,
      timestamp: Date.now() - 7200000,
      status: 'completed'
    },
    {
      id: '3',
      symbol: 'BTCUSDT',
      side: 'buy',
      quantity: 0.1,
      price: 41500,
      fee: 4.15,
      total: 4150,
      timestamp: Date.now() - 86400000,
      status: 'cancelled'
    }
  ]);

  // 资产分布数据
  const assetDistribution = positions.map(pos => ({
    name: pos.symbol,
    value: pos.usdValue,
    percent: (pos.usdValue / totalBalance * 100).toFixed(1)
  }));

  // 格式化数字
  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 渲染资产概览
  const renderOverview = () => (
    <div style={{ padding: '20px' }}>
      {/* 总资产卡片 */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
              总资产估值 (USDT)
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatNumber(totalBalance)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>今日盈亏:</span>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: todayPnL >= 0 ? '#4CAF50' : '#F44336'
              }}>
                {todayPnL >= 0 ? '+' : ''}{formatNumber(todayPnL)} ({todayPnL >= 0 ? '+' : ''}{todayPnLPercent}%)
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
              更新时间
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {new Date().toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </div>

      {/* 资产分布 */}
      <div style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '16px', fontSize: '18px' }}>
          资产分布
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {assetDistribution.map(asset => (
            <div key={asset.name} style={{
              background: theme.colors.background.secondary,
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${theme.colors.border.secondary}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
                  {asset.name}
                </span>
                <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
                  {asset.percent}%
                </span>
              </div>
              <div style={{ color: theme.colors.text.primary, fontSize: '16px', fontWeight: 'bold' }}>
                ${formatNumber(asset.value)}
              </div>
              {/* 简单的进度条 */}
              <div style={{
                width: '100%',
                height: '4px',
                background: theme.colors.background.primary,
                borderRadius: '2px',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${asset.percent}%`,
                  height: '100%',
                  background: theme.colors.primary.main,
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速操作 */}
      <div style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '16px', fontSize: '18px' }}>
          快速操作
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '充值', icon: '💰', color: theme.colors.success },
            { label: '提现', icon: '💸', color: theme.colors.warning },
            { label: '转账', icon: '🔄', color: theme.colors.primary.main },
            { label: '理财', icon: '📈', color: theme.colors.info }
          ].map(action => (
            <button
              key={action.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '8px',
                color: theme.colors.text.primary,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = action.color;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.background.secondary;
                e.currentTarget.style.color = theme.colors.text.primary;
              }}
            >
              <span style={{ fontSize: '16px' }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染持仓列表
  const renderPositions = () => (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          background: theme.colors.background.secondary
        }}>
          <h3 style={{ color: theme.colors.text.primary, margin: 0, fontSize: '18px' }}>
            我的持仓
          </h3>
        </div>
        
        {/* 表头 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 20px',
          background: theme.colors.background.secondary,
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          fontSize: '14px',
          color: theme.colors.text.secondary,
          fontWeight: 'bold'
        }}>
          <div>币种</div>
          <div>总量</div>
          <div>可用</div>
          <div>估值(USDT)</div>
          <div>均价</div>
          <div>盈亏</div>
        </div>

        {/* 持仓列表 */}
        {positions.map(position => (
          <div
            key={position.symbol}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: theme.colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {position.symbol.slice(0, 2)}
              </div>
              <div>
                <div style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
                  {position.symbol}
                </div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  {position.name}
                </div>
              </div>
            </div>
            
            <div style={{ color: theme.colors.text.primary }}>
              <div className="mono-font">{formatNumber(position.balance, 6)}</div>
              {position.frozen > 0 && (
                <div style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  冻结: {formatNumber(position.frozen, 6)}
                </div>
              )}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              {formatNumber(position.available, 6)}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              ${formatNumber(position.usdValue)}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              ${formatNumber(position.avgPrice)}
            </div>
            
            <div>
              <div className="mono-font" style={{
                color: position.pnl >= 0 ? theme.colors.success : theme.colors.danger,
                fontWeight: 'bold'
              }}>
                {position.pnl >= 0 ? '+' : ''}${formatNumber(position.pnl)}
              </div>
              <div style={{
                color: position.pnl >= 0 ? theme.colors.success : theme.colors.danger,
                fontSize: '12px'
              }}>
                {position.pnl >= 0 ? '+' : ''}{position.pnlPercent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染交易历史
  const renderHistory = () => (
    <div style={{ padding: '20px' }}>
      {/* 时间范围选择 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        {[
          { key: '1d', label: '1天' },
          { key: '7d', label: '7天' },
          { key: '30d', label: '30天' },
          { key: 'all', label: '全部' }
        ].map(range => (
          <button
            key={range.key}
            onClick={() => setTimeRange(range.key as any)}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              background: timeRange === range.key ? theme.colors.primary.main : theme.colors.background.secondary,
              color: timeRange === range.key ? 'white' : theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          background: theme.colors.background.secondary
        }}>
          <h3 style={{ color: theme.colors.text.primary, margin: 0, fontSize: '18px' }}>
            交易历史
          </h3>
        </div>
        
        {/* 表头 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 20px',
          background: theme.colors.background.secondary,
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          fontSize: '14px',
          color: theme.colors.text.secondary,
          fontWeight: 'bold'
        }}>
          <div>时间</div>
          <div>交易对</div>
          <div>方向</div>
          <div>数量</div>
          <div>价格</div>
          <div>手续费</div>
          <div>状态</div>
        </div>

        {/* 交易记录列表 */}
        {tradeHistory.map(trade => (
          <div
            key={trade.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              {formatTime(trade.timestamp)}
            </div>
            
            <div style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
              {trade.symbol}
            </div>
            
            <div style={{
              color: trade.side === 'buy' ? theme.colors.success : theme.colors.danger,
              fontWeight: 'bold'
            }}>
              {trade.side === 'buy' ? '买入' : '卖出'}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              {formatNumber(trade.quantity, 6)}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              ${formatNumber(trade.price)}
            </div>
            
            <div className="mono-font" style={{ color: theme.colors.text.primary }}>
              ${formatNumber(trade.fee)}
            </div>
            
            <div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                background: trade.status === 'completed' ? theme.colors.success : theme.colors.warning,
                color: 'white'
              }}>
                {trade.status === 'completed' ? '已完成' : '已取消'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: theme.colors.background.primary,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标签页导航 */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        background: theme.colors.background.card
      }}>
        {[
          { key: 'overview', label: '资产概览', icon: '📊' },
          { key: 'positions', label: '我的持仓', icon: '💼' },
          { key: 'history', label: '交易历史', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: activeTab === tab.key ? theme.colors.background.secondary : 'transparent',
              color: activeTab === tab.key ? theme.colors.primary.main : theme.colors.text.secondary,
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'positions' && renderPositions()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default AssetManagement;