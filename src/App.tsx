import { useState } from 'react';
import { Layout } from 'antd';
import { useAppSelector } from './store';
import { useWebSocket, useConnectionStatus } from './hooks/useWebSocket';
import TradingChart from './components/TradingChart';
import CoinList from './components/CoinList';
import PriceHeader from './components/PriceHeader';
import MarketOverview from './components/MarketOverview';
import TradingPanel from './components/TradingPanel';
import BottomPanel from './components/BottomPanel';
import AssetManagement from './components/AssetManagement';
import './styles/global.css';

const { Header, Content, Sider } = Layout;

function App() {
  const { selectedSymbol } = useAppSelector(state => state.market);
  const isAuthenticated = false; // 临时设置，后续会实现用户认证
  const [currentPage, setCurrentPage] = useState<'trading' | 'assets'>('trading');
  
  // 初始化WebSocket连接
  const { isConnected } = useWebSocket();
  const { status, error } = useConnectionStatus();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #3A4A5C'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            color: '#1890FF', 
            fontSize: '20px', 
            fontWeight: 'bold',
            marginRight: '32px'
          }}>
            CryptoTrader
          </div>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setCurrentPage('trading')}
              style={{ 
                background: 'none',
                border: 'none',
                color: currentPage === 'trading' ? '#1890FF' : '#B8C5D1',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === 'trading' ? 'bold' : 'normal'
              }}
            >
              现货交易
            </button>
            <button
              style={{ 
                background: 'none',
                border: 'none',
                color: '#B8C5D1',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              合约交易
            </button>
            <button
              onClick={() => setCurrentPage('assets')}
              style={{ 
                background: 'none',
                border: 'none',
                color: currentPage === 'assets' ? '#1890FF' : '#B8C5D1',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === 'assets' ? 'bold' : 'normal'
              }}
            >
              资产管理
            </button>
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 连接状态指示器 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#52C41A' : '#FF4D4F',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ 
              fontSize: '12px', 
              color: isConnected ? '#52C41A' : '#FF4D4F'
            }}>
              {isConnected ? 'WebSocket连接' : '连接断开'}
            </span>
            {error && (
              <span style={{ fontSize: '12px', color: '#FF4D4F' }}>
                ({error})
              </span>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <span style={{ color: '#B8C5D1' }}>总资产: ¥0.00</span>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#1890FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                U
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary">登录</button>
              <button className="btn-primary">注册</button>
            </div>
          )}
        </div>
      </Header>

      <Layout>
        {/* 左侧边栏 - 币种列表 */}
        <Sider 
          width={300} 
          style={{ 
            background: '#1A2332',
            borderRight: '1px solid #3A4A5C'
          }}
        >
          <CoinList />
        </Sider>

        {/* 主内容区域 */}
        <Layout>
          <Content style={{ padding: '16px', background: '#0B1426' }}>
            {currentPage === 'trading' ? (
              <>
                {/* 市场概览 */}
                <MarketOverview />
                
                {/* 当前币种价格信息 */}
                <PriceHeader />

                {/* 图表和交易面板区域 */}
                <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 480px)' }}>
                  {/* 图表区域 */}
                  <div style={{ 
                    flex: 1, 
                    background: '#243447', 
                    borderRadius: '8px',
                    border: '1px solid #3A4A5C',
                    overflow: 'hidden'
                  }}>
                    <TradingChart symbol={selectedSymbol} />
                  </div>

                  {/* 交易面板 */}
                  <TradingPanel />
                </div>

                {/* 底部信息面板 */}
                <BottomPanel />
              </>
            ) : (
              // 资产管理页面
              <div style={{ height: 'calc(100vh - 120px)' }}>
                <AssetManagement />
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;