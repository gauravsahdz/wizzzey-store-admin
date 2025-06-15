
"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { Inventory } from '@/types/ecommerce';
import { getInventoryItems, deleteInventoryItem } from '@/lib/apiService';
import { InventoryColumns } from './components/InventoryColumns'; 
import { DataTable } from '@/app/(admin)/products/components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import InventoryItemDialog from './components/InventoryItemDialog'; 
import BackButton from '@/components/BackButton';
import ConfirmationDialog from '@/components/ConfirmationDialog';


export default function ProductStockLevelsPage() {
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getInventoryItems(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.inventory) { 
        setInventoryItems(response.data.inventory);
        if (response.pagination) {
            setPagination(prev => ({
                ...prev,
                pageCount: response.pagination!.totalPages,
            }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch inventory items.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching inventory items.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleEdit = (item: Inventory) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
  };

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

  const handleDeleteRequested = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteInventoryItem(itemToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Inventory item deleted successfully." });
        fetchData(); 
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete item.", variant: "destructive" });
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
      <BackButton defaultHref="/inventory" />
      <PageHeader
        title="Product Stock Levels"
        description="Track and manage product stock levels based on Product IDs (uses core Inventory API)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Stock Item
            </Button>
          </div>
        }
      />
       <DataTable
        columns={InventoryColumns({ onEdit: handleEdit, onDeleteRequested: handleDeleteRequested })}
        data={inventoryItems}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='productId' 
        filterPlaceholder='Filter by product ID...'
      />
      <InventoryItemDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormDialogClose}
        item={editingItem}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item?"
      />
    </>
  );
}
