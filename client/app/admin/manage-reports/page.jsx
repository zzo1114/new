import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  FileText,
  CalendarDays,
  Tag,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { getReports, deleteReport } from '@/lib/api/reports';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  // 获取报告数据
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminReports', searchQuery, statusFilter, industryFilter],
    queryFn: () => getReports({ 
      search: searchQuery, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      industry: industryFilter !== 'all' ? industryFilter : undefined
    }),
  });
  
  // 删除报告
  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      toast({
        title: '成功',
        description: '报告已删除'
      });
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
    onError: (error) => {
      toast({
        title: '删除失败',
        description: error.message || '删除报告时发生错误',
        variant: 'destructive'
      });
    }
  });
  
  // 处理删除
  const handleDelete = (report) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };
  
  // 确认删除
  const confirmDelete = () => {
    if (reportToDelete) {
      deleteMutation.mutate(reportToDelete.id);
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  
  // 获取状态标签
  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">已发布</Badge>;
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>;
      case 'archived':
        return <Badge variant="outline">已归档</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理报告</h1>
          <p className="text-muted-foreground mt-2">
            查看和管理所有分析报告
          </p>
        </div>
        <Button onClick={() => router.push('/admin/create-report')}>
          <Plus className="mr-2 h-4 w-4" />
          创建报告
        </Button>
      </div>
      
      {/* 筛选区域 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="搜索报告..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                queryClient.invalidateQueries({ queryKey: ['adminReports'] });
              }
            }}
          />
        </div>
        
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={industryFilter} 
          onValueChange={setIndustryFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="行业" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有行业</SelectItem>
            <SelectItem value="technology">科技</SelectItem>
            <SelectItem value="finance">金融</SelectItem>
            <SelectItem value="healthcare">医疗健康</SelectItem>
            <SelectItem value="consumer">消费零售</SelectItem>
            <SelectItem value="energy">能源</SelectItem>
            <SelectItem value="manufacturing">制造业</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* 报告表格 */}
      <div className="border rounded-md">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium">获取报告失败</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        ) : data?.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">未找到报告</h3>
            <p className="text-muted-foreground">尝试调整筛选条件或创建新报告</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/admin/create-report')}
            >
              <Plus className="mr-2 h-4 w-4" />
              创建报告
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>行业</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      <Tag className="h-3 w-3 mr-1" />
                      {report.industry}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.views}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(report.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/reports/${report.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/edit-report/${report.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(report)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* 删除确认对话框 */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {reportToDelete ? (
                <>
                  您确定要删除报告 <strong>{reportToDelete.title}</strong> 吗？
                  此操作不可撤销。
                </>
              ) : (
                '您确定要删除此报告吗？此操作不可撤销。'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/80"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
