"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, RefreshCw, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon
import { Product } from '@/types/ecommerce';
import { getProducts, deleteProduct } from '@/lib/apiService';
import { ProductColumns } from './components/ProductColumns';
import { DataTable } from './components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { RowSelectionState } from '@tanstack/react-table';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.products) {
        setProducts(response.data.products);
        if (response.pagination) {
            setPageCount(response.pagination.totalPages);
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch products.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching products.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDeleteRequested = (productId: string) => {
    setItemToDeleteId(productId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteProduct(itemToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Product deleted successfully." });
        fetchData(); 
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete product.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  const handleCreateGroupedUrl = () => {
    const selectedProductIds = Object.keys(rowSelection).map(rowIndex => {
      const product = products[parseInt(rowIndex)];
      return product?.id;
    }).filter(Boolean);
    if (selectedProductIds.length === 0) {
      toast({ title: "No Selection", description: "Please select at least one product.", variant: "destructive" });
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_STORE_URL;
    const groupedUrl = `${baseUrl}/shop?products_ids=[${selectedProductIds.join(', ')}]`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(groupedUrl).then(() => {
      toast({ 
        title: "URL Copied", 
        description: `Grouped URL copied to clipboard: ${groupedUrl}` 
      });
    }).catch(() => {
      // Fallback if clipboard API fails
      toast({ 
        title: "URL Generated", 
        description: `Grouped URL: ${groupedUrl}` 
      });
    });
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage all products in your store."
        actions={
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <Button 
                variant="outline" 
                onClick={handleCreateGroupedUrl}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Create Grouped URL ({selectedCount})
              </Button>
            )}
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/products/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        }
      />
      <DataTable
        columns={ProductColumns({ onDeleteRequested: handleDeleteRequested })}
        data={products}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        filterColumn='name'
        filterPlaceholder='Filter products by name...'
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        enableRowSelection={true}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </>
  );
}
