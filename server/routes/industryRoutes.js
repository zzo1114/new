const express = require('express');
const industryController = require('../controllers/industryController');
const authController = require('../controllers/authController');

const router = express.Router();

// 获取所有行业
router.get('/', industryController.getAllIndustries);

// 获取特定行业详情
router.get('/:industry', industryController.getIndustryDetails);

// 仅管理员路由
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// 创建行业
router.post('/', industryController.createIndustry);

// 更新行业
router.put('/:id', industryController.updateIndustry);

// 删除行业
router.delete('/:id', industryController.deleteIndustry);

module.exports = router;
