import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 懒加载组件
const LazyTradingChart = lazy(() => import('./TradingChart'));
const LazyAssetManagement = lazy(() => import('./AssetManagement'));

// 加载中组件
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    background: '#243447',
    borderRadius: '8px',
    border: '1px solid #3A4A5C'
  }}>
    <Spin size="large" />
    <span style={{ marginLeft: '12px', color: '#B8C5D1' }}>加载中...</span>
  </div>
);

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('组件错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          background: '#243447',
          borderRadius: '8px',
          border: '1px solid #FF4D4F',
          color: '#FF4D4F'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>组件加载失败</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {this.state.error?.message || '未知错误'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#FF4D4F',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 优化的图表组件
export const OptimizedTradingChart = memo(({ symbol }: { symbol: string }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <LazyTradingChart symbol={symbol} />
      </Suspense>
    </ErrorBoundary>
  );
});

// 优化的资产管理组件
export const OptimizedAssetManagement = memo(() => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <LazyAssetManagement />
      </Suspense>
    </ErrorBoundary>
  );
});

// 虚拟滚动列表组件
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}

export const VirtualList = memo<VirtualListProps>(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
});

// 防抖Hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 节流Hook
export const useThrottle = <T,>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// 内存使用监控Hook
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = React.useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  React.useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// 性能监控组件
export const PerformanceMonitor = memo(() => {
  const memoryInfo = useMemoryMonitor();
  const [renderTime, setRenderTime] = React.useState<number>(0);

  React.useEffect(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      setRenderTime(end - start);
    };
  });

  if (!memoryInfo) return null;

  const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
    }}>
      <div>内存使用: {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
      <div>内存占用: {memoryUsagePercent.toFixed(1)}%</div>
      <div>渲染时间: {renderTime.toFixed(2)} ms</div>
    </div>
  );
});

// 图片懒加载组件
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LazyImage = memo<LazyImageProps>(({
  src,
  alt,
  width,
  height,
  placeholder,
  className,
  style
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      style={{
        width,
        height,
        background: placeholder || '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      className={className}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
      {!isLoaded && isInView && (
        <div style={{ color: '#999', fontSize: '12px' }}>加载中...</div>
      )}
    </div>
  );
});

// 数据预加载Hook
export const useDataPreloader = () => {
  const [preloadedData, setPreloadedData] = React.useState<Map<string, any>>(new Map());

  const preloadData = useCallback(async (key: string, dataLoader: () => Promise<any>) => {
    if (!preloadedData.has(key)) {
      try {
        const data = await dataLoader();
        setPreloadedData(prev => new Map(prev).set(key, data));
      } catch (error) {
        console.error(`预加载数据失败 (${key}):`, error);
      }
    }
  }, [preloadedData]);

  const getPreloadedData = useCallback((key: string) => {
    return preloadedData.get(key);
  }, [preloadedData]);

  const clearPreloadedData = useCallback((key?: string) => {
    if (key) {
      setPreloadedData(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      setPreloadedData(new Map());
    }
  }, []);

  return {
    preloadData,
    getPreloadedData,
    clearPreloadedData,
    preloadedKeys: Array.from(preloadedData.keys())
  };
};