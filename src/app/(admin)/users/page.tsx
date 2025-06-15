
"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { User } from '@/types/ecommerce';
import { getUsers, deleteUser } from '@/lib/apiService'; 
import { UserColumns } from './components/UserColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { useToast } from '@/hooks/use-toast';
import UserFormDialog from './components/UserFormDialog'; 
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();

  const [isUserFormDialogOpen, setIsUserFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.users) {
        setUsers(response.data.users);
        if (response.pagination) {
            setPagination(prev => ({
                ...prev,
                pageCount: response.pagination!.totalPages,
            }));
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch users.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An error occurred while fetching users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserFormDialogOpen(true);
  };

  const handleDeleteRequested = (userId: string) => {
    setItemToDeleteId(userId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteUser(itemToDeleteId);
      if (response.type === 'OK') {
        toast({ title: "Success", description: "User deleted successfully." });
        fetchData(); 
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete user.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while deleting user.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  const handleUserFormDialogClose = (refresh?: boolean) => {
    setIsUserFormDialogOpen(false);
    setEditingUser(null);
    if (refresh) {
      fetchData();
    }
  };

  const handleAddNewUser = () => {
    setEditingUser(null); 
    setIsUserFormDialogOpen(true);
  };


  return (
    <>
      <PageHeader
        title="User Management"
        description="Administer user accounts, roles, and permissions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNewUser} > 
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        }
      />
      <DataTable
        columns={UserColumns({ onEdit: handleEditUser, onDeleteRequested: handleDeleteRequested })}
        data={users}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        filterColumn='name'
        filterPlaceholder='Filter users by name...'
      />
      <UserFormDialog
        isOpen={isUserFormDialogOpen}
        onClose={handleUserFormDialogClose}
        userData={editingUser}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user?"
      />
    </>
  );
}
