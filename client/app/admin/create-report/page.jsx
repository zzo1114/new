import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { 
  ArrowLeft,
  ImagePlus,
  Plus,
  X,
  Save,
  FilePlus,
  LineChart,
  BarChart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { createReport } from '@/lib/api/reports';
import { getAllIndustries } from '@/lib/api/industries';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// 表单验证模式
const formSchema = z.object({
  title: z.string().min(10, '标题至少需要10个字符').max(100, '标题最多100个字符'),
  summary: z.string().min(30, '摘要至少需要30个字符').max(500, '摘要最多500个字符'),
  content: z.string().min(100, '内容至少需要100个字符'),
  industry: z.string().min(1, '请选择行业'),
  tags: z.array(z.string()).min(1, '至少添加一个标签'),
  coverImage: z.any().optional(),
  recommendation: z.string().min(1, '请选择投资建议'),
  riskLevel: z.string().min(1, '请选择风险等级'),
  expectedReturn: z.string().min(1, '请填写预期回报'),
  investmentHorizon: z.string().min(1, '请填写投资周期'),
  status: z.string().min(1, '请选择状态')
});

export default function CreateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState('');
  
  // 初始化表单
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      industry: '',
      tags: [],
      recommendation: 'hold',
      riskLevel: '中',
      expectedReturn: '',
      investmentHorizon: '',
      status: 'published'
    }
  });
  
  // 获取行业列表
  const { data: industries, isLoading: loadingIndustries } = useQuery({
    queryKey: ['industries'],
    queryFn: getAllIndustries
  });
  
  // 创建报告
  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      toast({
        title: '成功',
        description: '报告已成功创建',
      });
      router.push('/admin/manage-reports');
    },
    onError: (error) => {
      toast({
        title: '创建失败',
        description: error.message || '报告创建过程中发生错误',
        variant: 'destructive'
      });
    }
  });
  
  // 处理表单提交
  const onSubmit = (data) => {
    // 添加市场数据
    const reportData = {
      ...data,
      data: {
        growthData: [4.5, 5.2, 6.1, 5.8, 7.2, 6.9],
        marketAvgData: [3.8, 4.1, 4.5, 4.2, 4.7, 4.9],
        segmentLabels: ['细分1', '细分2', '细分3', '细分4', '细分5'],
        segmentData: [32, 24, 18, 16, 10]
      },
      keyMetrics: [
        {
          name: '市盈率',
          value: '22.5',
          description: '行业平均市盈率',
          trend: 'up'
        },
        {
          name: '增长率',
          value: '8.2%',
          description: '年均收入增长率',
          trend: 'up'
        },
        {
          name: '利润率',
          value: '15.3%',
          description: '平均净利润率',
          trend: 'down'
        },
        {
          name: '市值',
          value: '1.2万亿',
          description: '行业总市值',
          trend: 'neutral'
        }
      ],
      relatedCompanies: [
        {
          name: '示例公司1',
          symbol: 'EX1',
          price: 123.45,
          currency: 'CNY',
          change: 2.34
        },
        {
          name: '示例公司2',
          symbol: 'EX2',
          price: 45.67,
          currency: 'CNY',
          change: -1.23
        },
        {
          name: '示例公司3',
          symbol: 'EX3',
          price: 78.90,
          currency: 'CNY',
          change: 0.56
        },
        {
          name: '示例公司4',
          symbol: 'EX4',
          price: 234.56,
          currency: 'CNY',
          change: -0.89
        }
      ]
    };
    
    createReportMutation.mutate(reportData);
  };
  
  // 添加标签
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    
    // 检查标签是否已存在
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
    }
    
    setTagInput('');
  };
  
  // 删除标签
  const removeTag = (tagToRemove) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/manage-reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">创建新报告</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="content">报告内容</TabsTrigger>
              <TabsTrigger value="market">市场数据</TabsTrigger>
              <TabsTrigger value="settings">发布设置</TabsTrigger>
            </TabsList>
            
            {/* 基本信息 */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* 标题 */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报告标题</FormLabel>
                        <FormControl>
                          <Input placeholder="输入引人注目的标题" {...field} />
                        </FormControl>
                        <FormDescription>
                          清晰简洁的标题，能够准确描述报告内容
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 摘要 */}
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报告摘要</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="简要描述报告的主要内容和观点" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          摘要将显示在报告列表中，帮助用户快速了解内容
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 行业 */}
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属行业</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择行业" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingIndustries ? (
                              <SelectItem value="" disabled>
                                加载中...
                              </SelectItem>
                            ) : (
                              industries?.map((industry) => (
                                <SelectItem 
                                  key={industry.slug} 
                                  value={industry.slug}
                                >
                                  {industry.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          选择报告所属的行业类别
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 标签 */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="添加标签"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={addTag}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          添加相关标签，帮助用户更好地找到您的报告
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 封面图片 */}
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>封面图片</FormLabel>
                        <FormControl>
                          <div className="border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              点击上传或拖拽图片至此处
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              支持 PNG, JPG, JPEG, GIF 格式，最大 10MB
                            </p>
                          </div>
                        </FormControl>
                        <FormDescription>
                          上传引人注目的封面图片，增强报告的视觉吸引力
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 报告内容 */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>报告内容</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="详细的报告内容，支持Markdown格式" 
                            className="min-h-[500px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          使用Markdown语法编写专业的报告内容，支持标题、列表、加粗、链接等格式
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 市场数据 */}
            <TabsContent value="market" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* 投资建议 */}
                  <FormField
                    control={form.control}
                    name="recommendation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>投资建议</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择建议" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">买入</SelectItem>
                            <SelectItem value="hold">持有</SelectItem>
                            <SelectItem value="sell">卖出</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          基于分析给出的投资建议
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 风险等级 */}
                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>风险等级</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择风险等级" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="低">低</SelectItem>
                            <SelectItem value="中">中</SelectItem>
                            <SelectItem value="高">高</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          评估投资的风险水平
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 预期回报 */}
                  <FormField
                    control={form.control}
                    name="expectedReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>预期回报</FormLabel>
                        <FormControl>
                          <Input placeholder="如：8-10%" {...field} />
                        </FormControl>
                        <FormDescription>
                          预计的投资回报范围
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 投资周期 */}
                  <FormField
                    control={form.control}
                    name="investmentHorizon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>投资周期</FormLabel>
                        <FormControl>
                          <Input placeholder="如：中长期 (1-3年)" {...field} />
                        </FormControl>
                        <FormDescription>
                          建议的投资时间周期
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 图表演示 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">数据图表 (自动生成)</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <LineChart className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">行业增长趋势</h4>
                        </div>
                        <div className="h-48 flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">图表将基于行业数据自动生成</p>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-medium">各子行业占比</h4>
                        </div>
                        <div className="h-48 flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">图表将基于行业数据自动生成</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 发布设置 */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* 状态 */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>发布状态</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">草稿</SelectItem>
                            <SelectItem value="published">发布</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          设置报告的发布状态，草稿不会对用户公开
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* 提交按钮 */}
              <div className="flex items-center justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/admin/manage-reports')}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={createReportMutation.isPending}
                >
                  {createReportMutation.isPending ? (
                    <>正在保存...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存报告
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
