import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { addFavorite, removeFavorite } from '../store/slices/marketSlice';
import { theme } from '../styles/theme';

interface CoinFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  category: 'all' | 'favorites' | 'gainers' | 'losers' | 'volume';
  sortBy: 'price' | 'change' | 'volume' | 'marketCap';
  sortOrder: 'asc' | 'desc';
  priceRange: [number, number];
}

const CoinFilter: React.FC<CoinFilterProps> = ({ onFilterChange }) => {
  const dispatch = useAppDispatch();
  const { favorites, cryptoList } = useAppSelector(state => state.market);
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    sortBy: 'marketCap',
    sortOrder: 'desc',
    priceRange: [0, 100000]
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 更新筛选条件
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 获取分类统计
  const getCategoryStats = () => {
    const gainers = cryptoList.filter(crypto => crypto.changePercent24h > 0).length;
    const losers = cryptoList.filter(crypto => crypto.changePercent24h < 0).length;
    const highVolume = cryptoList.filter(crypto => crypto.volume24h > 100000000).length;
    
    return { gainers, losers, highVolume };
  };

  const stats = getCategoryStats();

  // 分类选项
  const categories = [
    { key: 'all', label: '全部', count: cryptoList.length },
    { key: 'favorites', label: '自选', count: favorites.length },
    { key: 'gainers', label: '涨幅榜', count: stats.gainers },
    { key: 'losers', label: '跌幅榜', count: stats.losers },
    { key: 'volume', label: '成交活跃', count: stats.highVolume }
  ];

  // 排序选项
  const sortOptions = [
    { key: 'marketCap', label: '市值' },
    { key: 'price', label: '价格' },
    { key: 'change', label: '涨跌幅' },
    { key: 'volume', label: '成交量' }
  ];

  return (
    <div style={{
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      {/* 搜索框 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="搜索币种名称或代码..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="trading-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* 分类筛选 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '12px',
          color: theme.colors.text.secondary,
          marginBottom: '8px'
        }}>
          分类筛选
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '6px'
        }}>
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => updateFilter('category', category.key)}
              style={{
                padding: '6px 8px',
                fontSize: '11px',
                background: filters.category === category.key ? theme.colors.primary.main : theme.colors.background.secondary,
                color: filters.category === category.key ? 'white' : theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{category.label}</span>
              <span style={{
                fontSize: '10px',
                opacity: 0.8
              }}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 排序选择 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '12px',
          color: theme.colors.text.secondary,
          marginBottom: '8px'
        }}>
          排序方式
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="trading-input"
            style={{ flex: 1 }}
          >
            {sortOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {filters.sortOrder === 'desc' ? '↓' : '↑'}
            {filters.sortOrder === 'desc' ? '降序' : '升序'}
          </button>
        </div>
      </div>

      {/* 高级筛选切换 */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '4px 12px',
            fontSize: '11px',
            background: 'transparent',
            color: theme.colors.primary.main,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            margin: '0 auto'
          }}
        >
          <span>{showAdvanced ? '收起' : '展开'}高级筛选</span>
          <span>{showAdvanced ? '↑' : '↓'}</span>
        </button>
      </div>

      {/* 高级筛选选项 */}
      {showAdvanced && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: theme.colors.background.secondary,
          borderRadius: '6px',
          border: `1px solid ${theme.colors.border.secondary}`
        }}>
          {/* 价格区间 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '12px',
              color: theme.colors.text.secondary,
              marginBottom: '8px'
            }}>
              价格区间 (USD)
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="最低价"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                className="trading-input"
                style={{ flex: 1 }}
              />
              <span style={{ color: theme.colors.text.secondary }}>-</span>
              <input
                type="number"
                placeholder="最高价"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                className="trading-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* 快速价格筛选 */}
          <div>
            <div style={{
              fontSize: '12px',
              color: theme.colors.text.secondary,
              marginBottom: '8px'
            }}>
              快速筛选
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: '< $1', range: [0, 1] },
                { label: '$1-$10', range: [1, 10] },
                { label: '$10-$100', range: [10, 100] },
                { label: '$100-$1000', range: [100, 1000] },
                { label: '> $1000', range: [1000, 100000] }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => updateFilter('priceRange', preset.range)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10px',
                    background: theme.colors.background.primary,
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinFilter;