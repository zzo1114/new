const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reports');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('仅支持图片文件!'));
    }
  }
});

// 公共路由
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReport);
router.get('/industry/:industry', reportController.getReportsByIndustry);

// 受保护的路由
router.use(authController.protect);

// 点赞和收藏
router.post('/:id/like', reportController.likeReport);
router.post('/:id/bookmark', reportController.bookmarkReport);

// 仅管理员路由
router.use(authController.restrictTo('admin'));

router.post('/', upload.single('coverImage'), reportController.createReport);
router.put('/:id', upload.single('coverImage'), reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
