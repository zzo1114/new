const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 默认路由处理
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '市场数据分析平台 API',
    status: 'active',
    timestamp: new Date()
  });
});

// 用于Render等平台的健康检查
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/market-analysis')
  .then(() => {
    console.log('成功连接到MongoDB');
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB连接错误:', err);
    process.exit(1);
  });
