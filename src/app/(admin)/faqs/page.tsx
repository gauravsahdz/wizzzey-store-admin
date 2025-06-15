
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { FAQ } from '@/types/ecommerce';
import { getFaqs, deleteFaq } from '@/lib/apiService';
import { FaqColumns } from './components/FaqColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getFaqs(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.faqs) {
        setFaqs(response.data.faqs);
        if (response.pagination) {
            setPagination(prev => ({
                ...prev,
                pageCount: response.pagination!.totalPages,
            }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch FAQs.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching FAQs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDeleteRequested = (faqId: string) => {
    setItemToDeleteId(faqId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteFaq(itemToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "FAQ deleted successfully." });
        fetchData();
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete FAQ.", variant: "destructive" });
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
        title="FAQ Management"
        description="Create, edit, and manage frequently asked questions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/faqs/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            </Link>
          </div>
        }
      />
      <DataTable
        columns={FaqColumns({ onDeleteRequested: handleDeleteRequested })}
        data={faqs}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='question'
        filterPlaceholder='Filter FAQs by question...'
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ?"
      />
    </>
  );
}
