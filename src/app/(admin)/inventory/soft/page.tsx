
"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { SoftInventoryItem } from '@/types/ecommerce';
import { getSoftInventoryItems, addSoftInventoryItem } from '@/lib/apiService'; // Mocked API
import { SoftInventoryColumns } from './components/SoftInventoryColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import SoftInventoryItemDialog from './components/SoftInventoryItemDialog';
import BackButton from '@/components/BackButton';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function SoftInventoryPage() {
  const [softInventory, setSoftInventory] = useState<SoftInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SoftInventoryItem | null>(null); 
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getSoftInventoryItems(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.softInventoryItems) {
        setSoftInventory(response.data.softInventoryItems);
        if (response.pagination) {
            setPagination(prev => ({ ...prev, pageCount: response.pagination!.totalPages }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch soft inventory.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching soft inventory.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleAddNew = () => {
    setEditingItem(null); 
    setIsFormDialogOpen(true);
  };
  
  const handleFormDialogClose = (refresh?: boolean) => {
    setIsFormDialogOpen(false);
    setEditingItem(null);
    if (refresh) {
      fetchData(); 
    }
  };
  
  const handleEdit = (item: SoftInventoryItem) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
    // toast({title: "Edit Clicked", description: "Edit functionality for soft inventory is a TBD."})
  };

  const handleDeleteRequested = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    // Actual delete logic would go here, e.g.:
    // setIsLoading(true);
    // try {
    //   const response = await deleteSoftInventoryItem(itemToDeleteId); // Needs actual API
    //   if (response.type === 'OK') {
    //     toast({ title: "Success", description: "Item deleted successfully." });
    //     fetchData(); 
    //   } else {
    //     toast({ title: "Error", description: response.message || "Failed to delete item.", variant: "destructive" });
    //   }
    // } catch (error) {
    //   toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    // } finally {
    //   setIsLoading(false);
    // }
    toast({title: "Delete Mock", description: `Called delete for ${itemToDeleteId}. Backend needed.`});
    // Optimistically remove or refetch for mock
    setSoftInventory(prev => prev.filter(item => item.id !== itemToDeleteId));
    setIsConfirmDeleteDialogOpen(false);
    setItemToDeleteId(null);
  };


  return (
    <>
      <BackButton defaultHref="/inventory" />
      <PageHeader
        title="Soft Inventory Management"
        description="Manage stock physically available (Wizzzey internal)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        }
      />
      <DataTable
        columns={SoftInventoryColumns({ onEdit: handleEdit, onDeleteRequested: handleDeleteRequested })}
        data={softInventory}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='sku'
        filterPlaceholder='Filter by SKU...'
      />
      <SoftInventoryItemDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormDialogClose}
        itemData={editingItem} 
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Soft Inventory Item"
        description="Are you sure you want to delete this item?"
      />
    </>
  );
}
