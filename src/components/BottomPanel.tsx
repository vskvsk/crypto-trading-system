import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { cancelOrder } from '../store/slices/tradingSlice';
import { theme } from '../styles/theme';

const BottomPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, orderHistory, recentTrades } = useAppSelector(state => state.trading);
  const { selectedSymbol } = useAppSelector(state => state.market);
  
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'trades'>('orders');

  // 取消订单
  const handleCancelOrder = (orderId: string) => {
    dispatch(cancelOrder(orderId));
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化日期时间
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.text.secondary;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.text.primary;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'filled':
        return '已成交';
      case 'cancelled':
        return '已取消';
      case 'pending':
        return '待成交';
      default:
        return status;
    }
  };

  return (
    <div style={{
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '8px',
      marginTop: '16px',
      height: '300px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标签页头部 */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
        background: theme.colors.background.secondary
      }}>
        {[
          { key: 'orders', label: '当前委托', count: orders.length },
          { key: 'history', label: '历史订单', count: orderHistory.length },
          { key: 'trades', label: '最新成交', count: recentTrades.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.key ? theme.colors.background.card : 'transparent',
              color: activeTab === tab.key ? theme.colors.text.primary : theme.colors.text.secondary,
              border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? '500' : 'normal',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: theme.colors.primary.main,
                color: 'white',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* 当前委托 */}
        {activeTab === 'orders' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            {orders.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.text.secondary,
                fontSize: '14px'
              }}>
                暂无委托订单
              </div>
            ) : (
              <table className="trading-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>币种</th>
                    <th>类型</th>
                    <th>方向</th>
                    <th>价格</th>
                    <th>数量</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{formatTime(order.timestamp)}</td>
                      <td>{order.symbol}</td>
                      <td>{order.type === 'limit' ? '限价' : '市价'}</td>
                      <td>
                        <span className={order.side === 'buy' ? 'price-up' : 'price-down'}>
                          {order.side === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className="mono-font">
                        {order.price ? `$${order.price.toFixed(2)}` : '市价'}
                      </td>
                      <td className="mono-font">{order.quantity.toFixed(6)}</td>
                      <td>
                        <span style={{ color: getStatusColor(order.status) }}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              background: theme.colors.danger,
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            取消
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 历史订单 */}
        {activeTab === 'history' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            {orderHistory.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.text.secondary,
                fontSize: '14px'
              }}>
                暂无历史订单
              </div>
            ) : (
              <table className="trading-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>币种</th>
                    <th>类型</th>
                    <th>方向</th>
                    <th>价格</th>
                    <th>数量</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.slice(0, 50).map(order => (
                    <tr key={order.id}>
                      <td>{formatDateTime(order.timestamp)}</td>
                      <td>{order.symbol}</td>
                      <td>{order.type === 'limit' ? '限价' : '市价'}</td>
                      <td>
                        <span className={order.side === 'buy' ? 'price-up' : 'price-down'}>
                          {order.side === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className="mono-font">
                        {order.price ? `$${order.price.toFixed(2)}` : '市价'}
                      </td>
                      <td className="mono-font">{order.quantity.toFixed(6)}</td>
                      <td>
                        <span style={{ color: getStatusColor(order.status) }}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 最新成交 */}
        {activeTab === 'trades' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            {recentTrades.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.text.secondary,
                fontSize: '14px'
              }}>
                暂无成交记录
              </div>
            ) : (
              <table className="trading-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>价格</th>
                    <th>数量</th>
                    <th>方向</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.slice(0, 100).map((trade, index) => (
                    <tr key={index}>
                      <td>{formatTime(trade.time)}</td>
                      <td className="mono-font">
                        <span className={trade.side === 'buy' ? 'price-up' : 'price-down'}>
                          ${trade.price.toFixed(2)}
                        </span>
                      </td>
                      <td className="mono-font">{trade.quantity.toFixed(6)}</td>
                      <td>
                        <span className={trade.side === 'buy' ? 'price-up' : 'price-down'}>
                          {trade.side === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;