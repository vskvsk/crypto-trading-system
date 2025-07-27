# 加密货币交易系统

一个基于 React 19 + TypeScript 构建的专业加密货币交易平台，集成实时WebSocket数据流和TradingView专业图表组件。

## 🚀 项目特色

- **实时数据流** - WebSocket连接，毫秒级价格更新
- **专业图表** - 集成TradingView轻量级图表库
- **完整交易功能** - 买卖订单、持仓管理、盈亏统计
- **技术指标分析** - 支持多种专业技术分析工具
- **响应式设计** - 适配桌面端和移动端
- **现代化架构** - React 19 + TypeScript + Redux Toolkit

## 🛠️ 技术栈

### 前端框架
- **React 19.1.0** - 最新版本React框架
- **TypeScript 5.8.3** - 类型安全的JavaScript超集
- **Vite 7.0.6** - 快速的前端构建工具

### 状态管理
- **Redux Toolkit 2.8.2** - 现代化的Redux状态管理
- **React-Redux 9.2.0** - React与Redux的连接库

### UI组件库
- **Ant Design 5.26.6** - 企业级UI设计语言
- **@ant-design/icons 5.5.2** - Ant Design图标库

### 图表组件
- **lightweight-charts 5.0.8** - TradingView轻量级图表库
- **Canvas API** - 自定义图表渲染

### 实时通信
- **Socket.io-client 4.8.1** - WebSocket实时通信
- **自定义WebSocket服务** - 处理实时行情数据

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript代码规范
- **Vite插件生态** - 开发体验优化

## 📦 安装依赖

```bash
# 使用npm安装
npm install

# 或使用yarn安装
yarn install

# 或使用pnpm安装
pnpm install
```

## 🚀 运行项目

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 或
yarn dev

# 访问地址: http://localhost:5173
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码检查
```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint错误
npm run lint:fix
```

## 🏗️ 项目结构

```
crypto-trading-system/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── AssetManagement.tsx    # 资产管理
│   │   ├── TradingChart.tsx       # 交易图表
│   │   ├── TradingPanel.tsx       # 交易面板
│   │   ├── CoinList.tsx           # 币种列表
│   │   ├── MarketOverview.tsx     # 市场概览
│   │   └── ...
│   ├── hooks/              # 自定义Hook
│   │   ├── useWebSocket.ts        # WebSocket连接
│   │   └── useDataManager.ts      # 数据管理
│   ├── services/           # 服务层
│   │   ├── api.ts                 # API接口
│   │   ├── websocket.ts           # WebSocket服务
│   │   └── dataManager.ts         # 数据管理器
│   ├── store/              # Redux状态管理
│   │   ├── slices/
│   │   │   ├── marketSlice.ts     # 市场数据
│   │   │   ├── tradingSlice.ts    # 交易数据
│   │   │   └── userSlice.ts       # 用户数据
│   │   └── index.ts
│   ├── types/              # TypeScript类型定义
│   ├── styles/             # 样式文件
│   └── App.tsx             # 主应用组件
├── package.json            # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明
```

## 🔧 配置说明

### 环境变量
创建 `.env` 文件配置环境变量：

```env
# API配置
VITE_API_BASE_URL=https://api.binance.com
VITE_WS_URL=wss://stream.binance.com:9443

# 开发配置
VITE_DEV_MODE=true
```

### Vite配置
项目使用Vite作为构建工具，支持：
- 热模块替换(HMR)
- TypeScript支持
- ESLint集成
- 生产环境优化

### TypeScript配置
- 严格类型检查
- 路径别名支持
- 现代ES模块语法

## 🌟 核心功能

### 实时行情
- 实时价格更新
- K线数据展示
- 深度图表
- 成交记录

### 交易功能
- 限价单/市价单
- 订单管理
- 持仓查看
- 盈亏统计

### 技术分析
- 多种技术指标
- 自定义指标参数
- 图表标注工具
- 历史数据回放

### 用户界面
- 响应式布局
- 暗色/亮色主题
- 自定义面板布局
- 快捷键支持

## 🚀 部署说明

### 本地部署
```bash
# 构建项目
npm run build

# 使用静态服务器
npx serve dist
```

### 云端部署
支持部署到：
- Vercel
- Netlify
- GitHub Pages
- 自定义服务器

## 📝 开发说明

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件采用函数式编程
- 使用React Hooks

### 性能优化
- 组件懒加载
- 虚拟滚动
- 数据缓存
- 防抖节流

### 测试
```bash
# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

## 🔗 相关链接

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Ant Design 官方文档](https://ant.design/)
- [TradingView 图表库](https://www.tradingview.com/charting-library/)

## 📄 许可证

MIT License

## 👨‍💻 开发者信息

**开发者：王志豪**  
**联系方式：360121615@qq.com**

---

*本项目仅供学习和演示使用，不构成任何投资建议。*