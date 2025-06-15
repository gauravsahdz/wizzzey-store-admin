
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { Category } from '@/types/ecommerce';
import { getCategories, deleteCategory } from '@/lib/apiService';
import { CategoryColumns } from './components/CategoryColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getCategories(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.categories) {
        setCategories(response.data.categories);
         if (response.pagination) {
            setPagination(prev => ({
                ...prev,
                pageCount: response.pagination!.totalPages,
            }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch categories.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching categories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDeleteRequested = (categoryId: string) => {
    setItemToDeleteId(categoryId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteCategory(itemToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Category deleted successfully." });
        fetchData(); 
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete category.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage product categories for your store."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/categories/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </Link>
          </div>
        }
      />
      <DataTable
        columns={CategoryColumns({ onDeleteRequested: handleDeleteRequested })} 
        data={categories}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='name'
        filterPlaceholder='Filter categories by name...'
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This might affect products associated with it."
      />
    </>
  );
}
