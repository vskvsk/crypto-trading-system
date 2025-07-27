import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { theme } from '../styles/theme';
import IndicatorPanel, { type TechnicalIndicator } from './IndicatorPanel';

interface TradingChartProps {
  symbol: string;
  height?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, height = 500 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const dispatch = useAppDispatch();
  const { klineData } = useAppSelector(state => state.market);
  
  // 本地技术指标状态
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [showIndicatorPanel, setShowIndicatorPanel] = useState(false);
  const [mockData, setMockData] = useState<any[]>([]);

  // 生成模拟K线数据
  const generateMockData = () => {
    const data = [];
    let basePrice = 50000;
    const now = Date.now();

    for (let i = 0; i < 100; i++) {
      const time = now - (100 - i) * 3600000; // 每小时一个数据点
      const change = (Math.random() - 0.5) * 1000;
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      const volume = Math.random() * 1000000 + 100000;

      data.push({
        time,
        open,
        high,
        low,
        close,
        volume,
      });

      basePrice = close;
    }

    return data;
  };

  // 绘制K线图
  const drawChart = () => {
    if (!canvasRef.current || !mockData.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 计算价格范围
    const prices = mockData.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    // 绘制参数
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height * 0.7 - padding * 2; // 70%用于K线，30%用于成交量
    const candleWidth = chartWidth / mockData.length * 0.8;

    // 绘制网格线
    ctx.strokeStyle = '#2B2B43';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // 绘制K线
    mockData.forEach((candle, index) => {
      const x = padding + (index * chartWidth) / mockData.length;
      const openY = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
      const closeY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
      const highY = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
      const lowY = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

      const isUp = candle.close > candle.open;
      const color = isUp ? '#26a69a' : '#ef5350';

      // 绘制影线
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // 绘制实体
      ctx.fillStyle = color;
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      if (bodyHeight < 1) {
        // 十字星
        ctx.fillRect(x, bodyY, candleWidth, 1);
      } else {
        ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
      }
    });

    // 绘制成交量
    const volumeHeight = rect.height * 0.25;
    const volumeY = rect.height - volumeHeight - 10;
    const maxVolume = Math.max(...mockData.map(d => d.volume));

    mockData.forEach((candle, index) => {
      const x = padding + (index * chartWidth) / mockData.length;
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const isUp = candle.close > candle.open;
      const color = isUp ? '#26a69a' : '#ef5350';

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x, volumeY + volumeHeight - volumeBarHeight, candleWidth, volumeBarHeight);
      ctx.globalAlpha = 1;
    });

    // 绘制价格标签
    ctx.fillStyle = '#d1d4dc';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(price.toFixed(2), padding - 5, y + 4);
    }

    // 绘制标题
    ctx.fillStyle = '#d1d4dc';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${symbol} - K线图`, padding, 25);

    // 绘制当前价格
    const currentPrice = mockData[mockData.length - 1]?.close || 0;
    const lastCandle = mockData[mockData.length - 1];
    const priceChange = lastCandle ? lastCandle.close - lastCandle.open : 0;
    const priceChangePercent = lastCandle ? (priceChange / lastCandle.open) * 100 : 0;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = priceChange >= 0 ? '#26a69a' : '#ef5350';
    ctx.fillText(
      `$${currentPrice.toFixed(2)} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`,
      padding + 200,
      25
    );
  };

  // 初始化数据和绘制
  useEffect(() => {
    const data = generateMockData();
    setMockData(data);
  }, [symbol]);

  useEffect(() => {
    if (mockData.length > 0) {
      drawChart();
    }
  }, [mockData, symbol]);

  // 窗口大小变化时重新绘制
  useEffect(() => {
    const handleResize = () => {
      setTimeout(drawChart, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mockData]);

  // 处理技术指标变化
  const handleIndicatorChange = (newIndicators: TechnicalIndicator[]) => {
    setIndicators(newIndicators);
    console.log('技术指标更新:', newIndicators);
    // 这里可以添加技术指标的绘制逻辑
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 图表工具栏 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* 时间周期选择 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['1m', '5m', '15m', '1h', '4h', '1d'].map(interval => (
            <button
              key={interval}
              onClick={() => {
                console.log(`切换到${interval}周期`);
                // 重新生成数据
                const newData = generateMockData();
                setMockData(newData);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                background: interval === '1h' ? theme.colors.primary.main : theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {interval}
            </button>
          ))}
        </div>

        {/* 图表类型选择 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'candle', label: '蜡烛图', icon: '📊' },
            { key: 'line', label: '折线图', icon: '📈' },
            { key: 'area', label: '面积图', icon: '📉' }
          ].map(type => (
            <button
              key={type.key}
              onClick={() => console.log(`切换到${type.label}`)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                background: type.key === 'candle' ? theme.colors.primary.main : theme.colors.background.secondary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={type.label}
            >
              <span>{type.icon}</span>
            </button>
          ))}
        </div>

        {/* 指标按钮 */}
        <button
          onClick={() => setShowIndicatorPanel(!showIndicatorPanel)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: showIndicatorPanel ? theme.colors.primary.main : theme.colors.background.secondary,
            color: showIndicatorPanel ? 'white' : theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          指标
        </button>

        {/* 刷新按钮 */}
        <button
          onClick={() => {
            const newData = generateMockData();
            setMockData(newData);
            console.log('数据已刷新');
          }}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔄 刷新
        </button>
      </div>

      {/* 图表容器 */}
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '100%',
          background: theme.colors.background.card,
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* 技术指标面板 */}
      {showIndicatorPanel && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 20,
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <IndicatorPanel onIndicatorChange={handleIndicatorChange} />
        </div>
      )}

      {/* 图表信息显示 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: theme.colors.text.primary,
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 10,
      }}>
        <div>数据点: {mockData.length}</div>
        <div>最新价格: ${mockData[mockData.length - 1]?.close.toFixed(2) || '0.00'}</div>
        <div>24h成交量: {(mockData[mockData.length - 1]?.volume || 0).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default TradingChart;