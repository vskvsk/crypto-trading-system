import React from 'react';
import { useAppSelector } from '../store';
import { theme } from '../styles/theme';

interface OrderConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    quantity: number;
    price?: number;
    totalValue: number;
    fee: number;
  } | null;
}

const OrderConfirmDialog: React.FC<OrderConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderData
}) => {
  const { cryptoList, selectedSymbol } = useAppSelector(state => state.market);

  if (!isOpen || !orderData) return null;

  const cryptoData = cryptoList.find(crypto => crypto.symbol === selectedSymbol);
  const currentPrice = cryptoData?.price || 0;
  const priceImpact = orderData.price ? 
    ((orderData.price - currentPrice) / currentPrice * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.colors.background.card,
        borderRadius: '12px',
        padding: '24px',
        width: '400px',
        maxWidth: '90vw',
        border: `1px solid ${theme.colors.border.primary}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* 标题 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: theme.colors.text.primary,
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            确认{orderData.side === 'buy' ? '买入' : '卖出'}订单
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.text.secondary,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* 订单详情 */}
        <div style={{
          background: theme.colors.background.secondary,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          {/* 币种和方向 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              交易对
            </span>
            <span style={{
              color: theme.colors.text.primary,
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {orderData.symbol}
            </span>
          </div>

          {/* 订单类型 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              订单类型
            </span>
            <span style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
              {orderData.type === 'limit' ? '限价单' : '市价单'}
            </span>
          </div>

          {/* 交易方向 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              交易方向
            </span>
            <span className={orderData.side === 'buy' ? 'price-up' : 'price-down'} style={{
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {orderData.side === 'buy' ? '买入' : '卖出'}
            </span>
          </div>

          {/* 数量 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              数量
            </span>
            <span className="mono-font" style={{
              color: theme.colors.text.primary,
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {orderData.quantity.toFixed(6)} {orderData.symbol.replace('USDT', '')}
            </span>
          </div>

          {/* 价格 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              {orderData.type === 'limit' ? '限价' : '预估价格'}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div className="mono-font" style={{
                color: theme.colors.text.primary,
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ${orderData.price?.toFixed(2) || currentPrice.toFixed(2)}
              </div>
              {orderData.type === 'limit' && Math.abs(priceImpact) > 0.1 && (
                <div style={{
                  fontSize: '11px',
                  color: priceImpact > 0 ? theme.colors.danger : theme.colors.success
                }}>
                  {priceImpact > 0 ? '+' : ''}{priceImpact.toFixed(2)}% vs 市价
                </div>
              )}
            </div>
          </div>

          {/* 分割线 */}
          <div style={{
            height: '1px',
            background: theme.colors.border.secondary,
            margin: '12px 0'
          }} />

          {/* 总价值 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              总价值
            </span>
            <span className="mono-font" style={{
              color: theme.colors.text.primary,
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {orderData.totalValue.toFixed(2)} USDT
            </span>
          </div>

          {/* 手续费 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
              手续费 (0.1%)
            </span>
            <span className="mono-font" style={{
              color: theme.colors.text.secondary,
              fontSize: '14px'
            }}>
              {orderData.fee.toFixed(4)} USDT
            </span>
          </div>

          {/* 实际成本/收入 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              color: theme.colors.text.primary,
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {orderData.side === 'buy' ? '实际成本' : '实际收入'}
            </span>
            <span className="mono-font" style={{
              color: theme.colors.text.primary,
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {orderData.side === 'buy' 
                ? (orderData.totalValue + orderData.fee).toFixed(2)
                : (orderData.totalValue - orderData.fee).toFixed(2)
              } USDT
            </span>
          </div>
        </div>

        {/* 风险提示 */}
        {orderData.type === 'market' && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: `1px solid ${theme.colors.warning}`,
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              color: theme.colors.warning,
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              ⚠️ 市价单风险提示
            </div>
            <div style={{
              color: theme.colors.text.secondary,
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              市价单将以当前最优价格立即成交，实际成交价格可能与显示价格有差异。
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.background.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.background.secondary;
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={orderData.side === 'buy' ? 'btn-success' : 'btn-danger'}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            确认{orderData.side === 'buy' ? '买入' : '卖出'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmDialog;