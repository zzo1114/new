import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/store/userStore';
import { getAdminStats } from '@/lib/api/admin';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useUserStore();
  
  // 在非管理员访问时重定向
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    } else if (!user) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);
  
  // 获取管理员统计数据
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    enabled: !!user && isAdmin,
  });
  
  if (!user || !isAdmin) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        <p className="text-muted-foreground mt-2">
          欢迎回来，{user.name}！这里是您的管理控制中心
        </p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 报告总数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">报告总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.newReportsPercent > 0 ? (
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      比上月增长 {stats.newReportsPercent}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      比上月减少 {Math.abs(stats?.newReportsPercent || 0)}%
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* 用户总数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.newUsersPercent > 0 ? (
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      比上月增长 {stats.newUsersPercent}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      比上月减少 {Math.abs(stats?.newUsersPercent || 0)}%
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* 总浏览量 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.viewsIncreasePercent > 0 ? (
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      比上月增长 {stats.viewsIncreasePercent}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      比上月减少 {Math.abs(stats?.viewsIncreasePercent || 0)}%
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* 总互动数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总互动数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalInteractions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.interactionsIncreasePercent > 0 ? (
                    <span className="text-green-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      比上月增长 {stats.interactionsIncreasePercent}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      比上月减少 {Math.abs(stats?.interactionsIncreasePercent || 0)}%
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* 快速操作按钮 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button 
          variant="outline" 
          className="h-20 justify-start px-4" 
          onClick={() => router.push('/admin/create-report')}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">创建新报告</span>
            <span className="text-xs text-muted-foreground">发布新的市场分析</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 justify-start px-4"
          onClick={() => router.push('/admin/manage-reports')}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">管理报告</span>
            <span className="text-xs text-muted-foreground">编辑或删除已有报告</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 justify-start px-4"
          onClick={() => router.push('/admin/users')}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">用户管理</span>
            <span className="text-xs text-muted-foreground">查看和管理用户</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20 justify-start px-4"
          onClick={() => router.push('/admin/settings')}
        >
          <div className="flex flex-col items-start">
            <span className="font-semibold">系统设置</span>
            <span className="text-xs text-muted-foreground">配置平台设置</span>
          </div>
        </Button>
      </div>
      
      {/* 行业分布 */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>行业分布</CardTitle>
            <CardDescription>按行业分类的报告数量</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.industries?.map((industry) => (
                  <div key={industry.name} className="flex items-center">
                    <div className="w-40 shrink-0">
                      <span className="font-medium">{industry.name}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${industry.percentage}%` }}></div>
                      <span>{industry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 热门报告 */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>热门报告</CardTitle>
            <CardDescription>按浏览量排名的报告</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.topReports?.map((report, index) => (
                  <div key={report.id} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{report.title}</h4>
                      <p className="text-xs text-muted-foreground">{report.views.toLocaleString()} 浏览</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
