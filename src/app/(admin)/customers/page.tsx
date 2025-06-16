'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileDown, PlusCircle } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { CustomerColumns } from './components/CustomerColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'email'>('name');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    [searchField]: searchTerm || undefined,
    role: 'Customer',
  });

  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  const handleDeleteRequested = (customerId: string) => {
    setCustomerToDelete(customerId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      // TODO: Implement delete customer API call
      toast({
        title: 'Coming soon',
        description: 'Delete functionality will be available soon.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Coming soon',
      description: 'Export functionality will be available soon.',
    });
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Customers"
          description="Manage your customer accounts."
        />
        <div className="mt-4 text-center text-red-500">
          Error loading customers. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customer accounts."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement add customer functionality
                toast({
                  title: 'Coming soon',
                  description: 'Add customer functionality will be available soon.',
                });
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        }
      />

      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={searchField}
              onValueChange={(value: 'name' | 'email') => setSearchField(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <DataTable
          columns={CustomerColumns({
            onViewCustomer: handleViewCustomer,
            onDeleteRequested: handleDeleteRequested,
          })}
          data={data?.data.users || []}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination}
          enableRowSelection
        />
      </div>

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </>
  );
}
