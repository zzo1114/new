const mongoose = require('mongoose');
const slugify = require('slugify');

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '行业必须有名称'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, '行业必须有描述']
  },
  image: {
    type: String
  },
  keyMetrics: [String],
  topCompanies: [
    {
      name: String,
      symbol: String,
      description: String
    }
  ],
  relatedIndustries: [
    {
      type: String,
      ref: 'Industry'
    }
  ],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 创建slug
industrySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// 查询中过滤非活跃行业
industrySchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Industry = mongoose.model('Industry', industrySchema);

module.exports = Industry;
