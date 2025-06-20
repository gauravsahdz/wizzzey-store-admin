"use client";
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Activity, PackageCheck } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getDashboardStats, getActivityLogs as fetchActivityLogs } from '@/lib/apiService';
import type { ActivityLog, DashboardStatsData } from '@/types/ecommerce';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  href?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, href, onClick, isLoading }) => {
  const cardContent = (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isLoading ? <Skeleton className="h-5 w-5" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{value}</div>}
        {isLoading ? <Skeleton className="h-4 w-1/2 mt-1" /> : description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href && !onClick) {
    return <Link href={href} passHref className="flex">{cardContent}</Link>;
  }
  if (onClick) {
    return <div onClick={onClick} className="flex">{cardContent}</div>
  }
  return <div className="flex">{cardContent}</div>;
};


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<DashboardStatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingActivity(true);

    try {
      const statsRes = await getDashboardStats();
      if ((statsRes.type === 'OK' || statsRes.type === 'SUCCESS') && statsRes.data) {
        setDashboardData(statsRes.data);
      } else {
        toast({ title: "Error", description: statsRes.message || "Failed to load dashboard statistics.", variant: "destructive" });
      }
    } catch (e) { 
      console.error("Could not fetch dashboard statistics:", e);
      toast({ title: "Error", description: "Could not fetch dashboard statistics.", variant: "destructive" });
    }
    finally { setIsLoadingStats(false); }

    try {
      const activityRes = await fetchActivityLogs(1, 3); 
      if (activityRes.type === 'OK' && activityRes.data?.activityLogs) {
        setRecentActivity(activityRes.data.activityLogs);
      } else {
        console.warn("Failed to load recent activity:", activityRes.message);
        setRecentActivity([]); 
      }
    } catch (e) { 
      console.error("Could not fetch recent activity:", e);
      setRecentActivity([]);
    }
    finally { setIsLoadingActivity(false); }

  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTodaysOrdersClick = () => router.push('/orders');

  const formattedSalesOverview = dashboardData?.salesOverview.map(item => ({
    name: format(parseISO(item.date), 'MMM d'),
    sales: item.revenue,
  })) || [];

  const formattedTopProducts = dashboardData?.topSellingProducts.map(item => ({
    name: item.productName,
    sales: item.totalQuantity,
  })) || [];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your Wizzzey store." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
            title="Today's Orders" 
            value={dashboardData?.todayStats?.orders?.toString() ?? "0"} 
            icon={PackageCheck} 
            description={`${dashboardData?.todayStats?.revenue !== undefined ? formatCurrency(dashboardData.todayStats.revenue) : "₹0.00"} today`}
            onClick={handleTodaysOrdersClick} 
            isLoading={isLoadingStats} 
        />
        <StatCard 
            title="Total Revenue" 
            value={`${dashboardData?.overallStats?.totalRevenue !== undefined ? formatCurrency(dashboardData.overallStats.totalRevenue) : "₹0.00"}`} 
            icon={DollarSign} 
            description="All-time revenue" 
            href="/orders?filter=revenue" 
            isLoading={isLoadingStats} 
        />
        <StatCard 
            title="Total Orders" 
            value={dashboardData?.overallStats?.totalOrders?.toString() ?? "0"} 
            icon={ShoppingCart} 
            description="All-time orders" 
            href="/orders" 
            isLoading={isLoadingStats} 
        />
        <StatCard 
            title="Total Customers" 
            value={dashboardData?.overallStats?.totalCustomers?.toString() ?? "0"} 
            icon={Users} 
            description="All-time customers" 
            href="/customers" 
            isLoading={isLoadingStats}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
            <CardDescription>
                <Link href="/products?view=sales-overview" className="text-sm text-primary hover:underline">View detailed report &rarr;</Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoadingStats ? <Skeleton className="w-full h-full" /> : formattedSalesOverview.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={formattedSalesOverview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), "Revenue"]}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No sales data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
             <CardDescription>
                <Link href="/products?sort=top-selling" className="text-sm text-primary hover:underline">View all products &rarr;</Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
                 <div className="space-y-3"> {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)} </div>
            ) : formattedTopProducts.length > 0 ? (
              <ul className="space-y-3">
                {formattedTopProducts.slice(0, 5).map((product) => (
                  <li key={product.name} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm text-primary font-semibold">{product.sales} units</span>
                  </li>
                ))}
              </ul>
            ) : (
               <div className="flex items-center justify-center h-full text-muted-foreground">No product data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            <Link href="/activity-logs" className="text-sm text-primary hover:underline">View all activity &rarr;</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="space-y-4"> {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)} </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map(log => (
                  <div key={log.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                      <Activity className="h-5 w-5 mr-3 text-accent flex-shrink-0" />
                      <div className="flex-grow">
                          <p className="text-sm font-medium">
                            User '{log.user?.name || log.user?.email || log.userId.substring(0,8)}...' {log.action.toLowerCase()} 
                            {log.entityType && ` ${log.entityType.toLowerCase()}`}
                            {log.details && (log.details as any).name ? ` '${(log.details as any).name}'.` : '.'}
                          </p>
                          {log.createdAt && <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>}
                      </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No recent activity.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    