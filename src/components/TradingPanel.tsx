import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { useRealTimeData } from '../hooks/useWebSocket';
import { addOrder } from '../store/slices/tradingSlice';
import OrderConfirmDialog from './OrderConfirmDialog';
import { theme } from '../styles/theme';
import { type Order } from '../types';

const TradingPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedSymbol } = useAppSelector(state => state.market);
  const { orderBook } = useAppSelector(state => state.trading);
  const { cryptoData } = useRealTimeData();
  
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  // 当前价格
  const currentPrice = cryptoData?.price || 0;
  
  // 可用余额（模拟数据）
  const availableBalance = 10000; // USDT
  const availableCrypto = 0.5; // BTC等

  // 更新价格输入框
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [orderType, currentPrice]);

  // 计算总价值
  const totalValue = parseFloat(quantity || '0') * parseFloat(price || '0');
  
  // 计算手续费（0.1%）
  const fee = totalValue * 0.001;

  // 处理百分比选择
  const handlePercentageClick = (percent: number) => {
    setPercentage(percent);
    if (orderSide === 'buy') {
      const maxQuantity = (availableBalance * percent / 100) / currentPrice;
      setQuantity(maxQuantity.toFixed(6));
    } else {
      const maxQuantity = availableCrypto * percent / 100;
      setQuantity(maxQuantity.toFixed(6));
    }
  };

  // 处理下单
  const handlePlaceOrder = () => {
    if (!quantity || !price) {
      alert('请输入数量和价格');
      return;
    }

    // 准备订单数据用于确认对话框
    const orderData = {
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType === 'limit' ? parseFloat(price) : currentPrice,
      totalValue: totalValue,
      fee: fee
    };

    setPendingOrder(orderData);
    setShowConfirmDialog(true);
  };

  // 确认下单
  const handleConfirmOrder = () => {
    if (!pendingOrder) return;

    const order: Order = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      quantity: pendingOrder.quantity,
      price: orderType === 'limit' ? pendingOrder.price : undefined,
      status: 'pending',
      timestamp: Date.now(),
    };

    dispatch(addOrder(order));
    
    // 清空表单和对话框
    setQuantity('');
    if (orderType === 'limit') {
      setPrice('');
    }
    setPercentage(0);
    setShowConfirmDialog(false);
    setPendingOrder(null);
  };

  // 取消下单
  const handleCancelOrder = () => {
    setShowConfirmDialog(false);
    setPendingOrder(null);
  };

  // 使用订单簿价格
  const handleOrderBookClick = (price: number, isBid: boolean) => {
    setPrice(price.toFixed(2));
    setOrderSide(isBid ? 'sell' : 'buy');
  };

  return (
    <div style={{ 
      width: '320px', 
      background: theme.colors.background.card, 
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border.primary}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* 交易面板头部 */}
      <div style={{ 
        padding: '16px', 
        borderBottom: `1px solid ${theme.colors.border.secondary}`
      }}>
        <h3 style={{ color: theme.colors.text.primary, marginBottom: '16px', fontSize: '16px' }}>
          现货交易
        </h3>
        
        {/* 买卖切换 */}
        <div style={{ display: 'flex', marginBottom: '16px', background: theme.colors.background.secondary, borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={() => setOrderSide('buy')}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: orderSide === 'buy' ? theme.colors.success : 'transparent',
              color: orderSide === 'buy' ? 'white' : theme.colors.text.secondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            买入
          </button>
          <button
            onClick={() => setOrderSide('sell')}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: orderSide === 'sell' ? theme.colors.danger : 'transparent',
              color: orderSide === 'sell' ? 'white' : theme.colors.text.secondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            卖出
          </button>
        </div>

        {/* 订单类型 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: theme.colors.text.secondary, fontSize: '12px', marginBottom: '8px' }}>
            订单类型
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setOrderType('limit')}
              style={{
                flex: 1,
                padding: '6px 12px',
                fontSize: '12px',
                background: orderType === 'limit' ? theme.colors.primary.main : theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              限价单
            </button>
            <button
              onClick={() => setOrderType('market')}
              style={{
                flex: 1,
                padding: '6px 12px',
                fontSize: '12px',
                background: orderType === 'market' ? theme.colors.primary.main : theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              市价单
            </button>
          </div>
        </div>

        {/* 价格输入 */}
        {orderType === 'limit' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px' 
            }}>
              <span style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                价格
              </span>
              <span style={{ color: theme.colors.text.secondary, fontSize: '11px' }}>
                当前: ${currentPrice.toFixed(2)}
              </span>
            </div>
            <input 
              type="number" 
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="trading-input"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* 数量输入 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px' 
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
              数量
            </span>
            <span style={{ color: theme.colors.text.secondary, fontSize: '11px' }}>
              可用: {orderSide === 'buy' ? `${availableBalance.toFixed(2)} USDT` : `${availableCrypto.toFixed(6)} ${selectedSymbol.replace('USDT', '')}`}
            </span>
          </div>
          <input 
            type="number" 
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="trading-input"
            style={{ width: '100%' }}
          />
          
          {/* 百分比按钮 */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {[25, 50, 75, 100].map(percent => (
              <button
                key={percent}
                onClick={() => handlePercentageClick(percent)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: percentage === percent ? theme.colors.primary.main : theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* 订单摘要 */}
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          background: theme.colors.background.secondary, 
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: theme.colors.text.secondary }}>总价值</span>
            <span className="mono-font" style={{ color: theme.colors.text.primary }}>
              {totalValue.toFixed(2)} USDT
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: theme.colors.text.secondary }}>手续费</span>
            <span className="mono-font" style={{ color: theme.colors.text.primary }}>
              {fee.toFixed(4)} USDT
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.text.secondary }}>实际成本</span>
            <span className="mono-font" style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>
              {(totalValue + fee).toFixed(2)} USDT
            </span>
          </div>
        </div>

        {/* 下单按钮 */}
        <button 
          onClick={handlePlaceOrder}
          disabled={!quantity || !price}
          className={orderSide === 'buy' ? 'btn-success' : 'btn-danger'}
          style={{ 
            width: '100%', 
            padding: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: (!quantity || !price) ? 0.5 : 1,
            cursor: (!quantity || !price) ? 'not-allowed' : 'pointer'
          }}
        >
          {orderSide === 'buy' ? '买入' : '卖出'} {selectedSymbol.replace('USDT', '')}
        </button>
      </div>

      {/* 订单簿 */}
      <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
        <h4 style={{ color: theme.colors.text.primary, marginBottom: '12px', fontSize: '14px' }}>
          订单簿
        </h4>
        
        <div style={{ height: '200px', overflowY: 'auto' }}>
          {/* 卖单 */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              fontSize: '11px',
              color: theme.colors.text.secondary,
              marginBottom: '4px',
              padding: '0 4px'
            }}>
              <div>价格(USDT)</div>
              <div style={{ textAlign: 'right' }}>数量</div>
            </div>
            
            {orderBook.asks.slice(0, 5).reverse().map(([price, quantity]: [number, number], index: number) => (
              <div 
                key={`ask-${index}`}
                onClick={() => handleOrderBookClick(price, false)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.background.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="mono-font price-down">{price.toFixed(2)}</div>
                <div className="mono-font" style={{ textAlign: 'right', color: theme.colors.text.primary }}>
                  {quantity.toFixed(4)}
                </div>
              </div>
            ))}
          </div>

          {/* 当前价格 */}
          <div style={{ 
            textAlign: 'center', 
            padding: '8px',
            background: theme.colors.background.secondary,
            borderRadius: '4px',
            marginBottom: '8px'
          }}>
            <div className="mono-font" style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: cryptoData?.changePercent24h && cryptoData.changePercent24h >= 0 ? theme.colors.success : theme.colors.danger
            }}>
              ${currentPrice.toFixed(2)}
            </div>
          </div>

          {/* 买单 */}
          <div>
            {orderBook.bids.slice(0, 5).map(([price, quantity]: [number, number], index: number) => (
              <div 
                key={`bid-${index}`}
                onClick={() => handleOrderBookClick(price, true)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.background.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="mono-font price-up">{price.toFixed(2)}</div>
                <div className="mono-font" style={{ textAlign: 'right', color: theme.colors.text.primary }}>
                  {quantity.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 订单确认对话框 */}
      <OrderConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelOrder}
        onConfirm={handleConfirmOrder}
        orderData={pendingOrder}
      />
    </div>
  );
};

export default TradingPanel;