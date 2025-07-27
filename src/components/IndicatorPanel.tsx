import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { theme } from '../styles/theme';

// 技术指标类型定义
export interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'MA' | 'EMA' | 'RSI' | 'MACD' | 'BOLL' | 'KDJ' | 'VOL';
  enabled: boolean;
  color: string;
  parameters: Record<string, number>;
  visible: boolean;
}

// 预设指标配置
const INDICATOR_PRESETS: Record<string, Omit<TechnicalIndicator, 'id' | 'enabled'>> = {
  MA5: {
    name: '移动平均线(5)',
    type: 'MA',
    color: '#FF6B6B',
    parameters: { period: 5 },
    visible: true
  },
  MA10: {
    name: '移动平均线(10)',
    type: 'MA',
    color: '#4ECDC4',
    parameters: { period: 10 },
    visible: true
  },
  MA20: {
    name: '移动平均线(20)',
    type: 'MA',
    color: '#45B7D1',
    parameters: { period: 20 },
    visible: true
  },
  MA60: {
    name: '移动平均线(60)',
    type: 'MA',
    color: '#FFA07A',
    parameters: { period: 60 },
    visible: true
  },
  EMA12: {
    name: '指数移动平均线(12)',
    type: 'EMA',
    color: '#98D8C8',
    parameters: { period: 12 },
    visible: true
  },
  EMA26: {
    name: '指数移动平均线(26)',
    type: 'EMA',
    color: '#F7DC6F',
    parameters: { period: 26 },
    visible: true
  },
  RSI14: {
    name: '相对强弱指标(14)',
    type: 'RSI',
    color: '#BB8FCE',
    parameters: { period: 14, overbought: 70, oversold: 30 },
    visible: true
  },
  MACD: {
    name: 'MACD指标',
    type: 'MACD',
    color: '#85C1E9',
    parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    visible: true
  },
  BOLL20: {
    name: '布林带(20)',
    type: 'BOLL',
    color: '#F8C471',
    parameters: { period: 20, stdDev: 2 },
    visible: true
  },
  KDJ: {
    name: 'KDJ随机指标',
    type: 'KDJ',
    color: '#AED6F1',
    parameters: { kPeriod: 9, dPeriod: 3, jPeriod: 3 },
    visible: true
  },
  VOL: {
    name: '成交量',
    type: 'VOL',
    color: '#A9DFBF',
    parameters: { period: 5 },
    visible: true
  }
};

interface IndicatorPanelProps {
  onIndicatorChange: (indicators: TechnicalIndicator[]) => void;
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ onIndicatorChange }) => {
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customParameters, setCustomParameters] = useState<Record<string, number>>({});

  // 添加指标
  const handleAddIndicator = () => {
    if (!selectedPreset) return;

    const preset = INDICATOR_PRESETS[selectedPreset];
    const newIndicator: TechnicalIndicator = {
      id: `${preset.type}_${Date.now()}`,
      ...preset,
      enabled: true,
      parameters: { ...preset.parameters, ...customParameters }
    };

    const updatedIndicators = [...indicators, newIndicator];
    setIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);

    // 重置表单
    setSelectedPreset('');
    setCustomParameters({});
    setShowAddDialog(false);
  };

  // 删除指标
  const handleRemoveIndicator = (id: string) => {
    const updatedIndicators = indicators.filter(ind => ind.id !== id);
    setIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
  };

  // 切换指标启用状态
  const handleToggleIndicator = (id: string) => {
    const updatedIndicators = indicators.map(ind =>
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    );
    setIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
  };

  // 更新指标参数
  const handleUpdateParameters = (id: string, parameters: Record<string, number>) => {
    const updatedIndicators = indicators.map(ind =>
      ind.id === id ? { ...ind, parameters } : ind
    );
    setIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
  };

  // 更新指标颜色
  const handleUpdateColor = (id: string, color: string) => {
    const updatedIndicators = indicators.map(ind =>
      ind.id === id ? { ...ind, color } : ind
    );
    setIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
  };

  // 获取指标类型的中文名称
  const getIndicatorTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'MA': '移动平均线',
      'EMA': '指数移动平均线',
      'RSI': '相对强弱指标',
      'MACD': 'MACD指标',
      'BOLL': '布林带',
      'KDJ': 'KDJ指标',
      'VOL': '成交量'
    };
    return typeNames[type] || type;
  };

  return (
    <div style={{
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      {/* 标题和添加按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          color: theme.colors.text.primary,
          fontSize: '16px',
          fontWeight: 'bold',
          margin: 0
        }}>
          技术指标
        </h4>
        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: theme.colors.primary.main,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>+</span>
          添加指标
        </button>
      </div>

      {/* 当前指标列表 */}
      <div style={{ marginBottom: '16px' }}>
        {indicators.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontSize: '14px',
            padding: '20px'
          }}>
            暂无技术指标，点击"添加指标"开始使用
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {indicators.map(indicator => (
              <div
                key={indicator.id}
                style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: '6px',
                  padding: '12px'
                }}
              >
                {/* 指标头部 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* 启用开关 */}
                    <input
                      type="checkbox"
                      checked={indicator.enabled}
                      onChange={() => handleToggleIndicator(indicator.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* 颜色指示器 */}
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: indicator.color,
                        border: `1px solid ${theme.colors.border.primary}`
                      }}
                    />
                    
                    {/* 指标名称 */}
                    <span style={{
                      color: indicator.enabled ? theme.colors.text.primary : theme.colors.text.secondary,
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {indicator.name}
                    </span>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleRemoveIndicator(indicator.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.text.secondary,
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '2px'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* 指标参数 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  {Object.entries(indicator.parameters).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: theme.colors.text.secondary }}>
                        {key === 'period' ? '周期' :
                         key === 'fastPeriod' ? '快线' :
                         key === 'slowPeriod' ? '慢线' :
                         key === 'signalPeriod' ? '信号线' :
                         key === 'stdDev' ? '标准差' :
                         key === 'overbought' ? '超买' :
                         key === 'oversold' ? '超卖' :
                         key === 'kPeriod' ? 'K周期' :
                         key === 'dPeriod' ? 'D周期' :
                         key === 'jPeriod' ? 'J周期' : key}
                      </span>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newParams = { ...indicator.parameters, [key]: Number(e.target.value) };
                          handleUpdateParameters(indicator.id, newParams);
                        }}
                        style={{
                          padding: '4px 6px',
                          fontSize: '11px',
                          background: theme.colors.background.primary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: '3px',
                          width: '100%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加指标对话框 */}
      {showAddDialog && (
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
            {/* 对话框标题 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: theme.colors.text.primary,
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0
              }}>
                添加技术指标
              </h3>
              <button
                onClick={() => setShowAddDialog(false)}
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

            {/* 指标选择 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                color: theme.colors.text.secondary,
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                选择指标类型
              </div>
              <select
                value={selectedPreset}
                onChange={(e) => {
                  setSelectedPreset(e.target.value);
                  if (e.target.value) {
                    setCustomParameters(INDICATOR_PRESETS[e.target.value].parameters);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '6px'
                }}
              >
                <option value="">请选择指标</option>
                {Object.entries(INDICATOR_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 参数配置 */}
            {selectedPreset && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  color: theme.colors.text.secondary,
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  参数配置
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  {Object.entries(customParameters).map(([key, value]) => (
                    <div key={key}>
                      <label style={{
                        display: 'block',
                        color: theme.colors.text.secondary,
                        fontSize: '12px',
                        marginBottom: '4px'
                      }}>
                        {key === 'period' ? '周期' :
                         key === 'fastPeriod' ? '快线周期' :
                         key === 'slowPeriod' ? '慢线周期' :
                         key === 'signalPeriod' ? '信号线周期' :
                         key === 'stdDev' ? '标准差倍数' :
                         key === 'overbought' ? '超买线' :
                         key === 'oversold' ? '超卖线' :
                         key === 'kPeriod' ? 'K值周期' :
                         key === 'dPeriod' ? 'D值周期' :
                         key === 'jPeriod' ? 'J值周期' : key}
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setCustomParameters({
                          ...customParameters,
                          [key]: Number(e.target.value)
                        })}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '14px',
                          background: theme.colors.background.secondary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.border.primary}`,
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAddDialog(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '14px',
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={handleAddIndicator}
                disabled={!selectedPreset}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '14px',
                  background: selectedPreset ? theme.colors.primary.main : theme.colors.background.secondary,
                  color: selectedPreset ? 'white' : theme.colors.text.secondary,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedPreset ? 'pointer' : 'not-allowed'
                }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorPanel;