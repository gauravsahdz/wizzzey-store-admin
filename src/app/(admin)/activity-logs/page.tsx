
"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { ActivityLog } from '@/types/ecommerce';
import { getActivityLogs } from '@/lib/apiService';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import { UserCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'; // Added Button

const ActivityLogColumns = (): ColumnDef<ActivityLog>[] => [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
      return (
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{user?.name || row.original.userId}</span>
        </div>
      );
    }
  },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "entityType", header: "Entity Type" },
  { accessorKey: "entityId", header: "Entity ID" },
  { 
    accessorKey: "createdAt", 
    header: "Timestamp",
    cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleString(),
  },
];


export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getActivityLogs(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.activityLogs) {
        setLogs(response.data.activityLogs);
        if (response.pagination) {
           setPagination(prev => ({ ...prev, pageCount: response.pagination!.totalPages }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch activity logs.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching activity logs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);
  
  return (
    <>
      <PageHeader
        title="Activity Logs"
        description="Track user and system activities within the admin panel."
        actions={
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
       <DataTable
        columns={ActivityLogColumns()}
        data={logs}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='action'
        filterPlaceholder='Filter by action...'
      />
    </>
  );
}
