const Industry = require('../models/Industry');
const Report = require('../models/Report');

// 获取所有行业
exports.getAllIndustries = async (req, res, next) => {
  try {
    const industries = await Industry.find();
    
    res.status(200).json({
      status: 'success',
      results: industries.length,
      data: industries
    });
  } catch (err) {
    next(err);
  }
};

// 获取行业详情
exports.getIndustryDetails = async (req, res, next) => {
  try {
    const industry = req.params.industry;
    
    // 查找行业信息
    const industryInfo = await Industry.findOne({ slug: industry });
    
    if (!industryInfo) {
      return res.status(404).json({
        status: 'fail',
        message: '未找到该行业'
      });
    }
    
    // 获取行业相关的报告
    const reports = await Report.find({ 
      industry, 
      status: 'published' 
    })
    .sort({ createdAt: -1 })
    .limit(10);
    
    // 获取行业统计
    const totalReports = await Report.countDocuments({ 
      industry, 
      status: 'published' 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        industry: industryInfo,
        reports,
        stats: {
          totalReports
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// 创建行业
exports.createIndustry = async (req, res, next) => {
  try {
    const newIndustry = await Industry.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newIndustry
    });
  } catch (err) {
    next(err);
  }
};

// 更新行业
exports.updateIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!industry) {
      return res.status(404).json({
        status: 'fail',
        message: '未找到该行业'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: industry
    });
  } catch (err) {
    next(err);
  }
};

// 删除行业
exports.deleteIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);
    
    if (!industry) {
      return res.status(404).json({
        status: 'fail',
        message: '未找到该行业'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
