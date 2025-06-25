'use client';

import { use } from 'react';
import PageHeader from '@/components/PageHeader';
import { useOrder } from '@/hooks/use-orders';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { OrderStatus } from '@/types/order';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateOrder, deleteOrder } from '@/lib/apiService';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useOrder(id as string);
  const { toast } = useToast();
  const router = useRouter();

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-4 text-center text-red-500">
          Error loading order details. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  const order = data?.data.order;

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-4 text-center text-muted-foreground">
          Order not found.
        </div>
      </div>
    );
  }

  // Handlers
  const handleEditOpen = () => {
    setEditStatus(order.status);
    setEditNotes(order.notes || '');
    setEditOpen(true);
  };
  const handleEditSave = async () => {
    setUpdating(true);
    const res = await updateOrder(order.id, { status: editStatus, notes: editNotes });
    setUpdating(false);
    if (res.type === 'OK') {
      toast({ title: 'Order updated', description: 'Order updated successfully.' });
      setEditOpen(false);
      refetch && refetch();
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to update order.', variant: 'destructive' });
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteOrder(order.id);
    setDeleting(false);
    if (res.type === 'OK') {
      toast({ title: 'Order deleted', description: 'Order deleted successfully.' });
      setDeleteOpen(false);
      router.push('/orders');
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to delete order.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <BackButton defaultHref="/orders" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditOpen}>Edit</Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Coming soon',
                description: 'Print functionality will be available soon.',
              });
            }}
          >
            Print Order
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Coming soon',
                description: 'Export functionality will be available soon.',
              });
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Status</label>
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <label className="block text-sm font-medium">Notes</label>
            <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updating}>Cancel</Button>
            <Button onClick={handleEditSave} loading={updating}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this order? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title={`Order #${order.id}`}
        description={`Placed on ${formatDate(order.createdAt)}`}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span>{' '}
              {order.customerInfo.name}
            </div>
            <div>
              <span className="font-medium">Email:</span>{' '}
              {order.customerInfo.email}
            </div>
            {order.customerInfo.phone && (
              <div>
                <span className="font-medium">Phone:</span>{' '}
                {order.customerInfo.phone}
              </div>
            )}
            <div>
              <span className="font-medium">Shipping Address:</span>{' '}
              {order.customerInfo.shippingAddress}
            </div>
            {order.customerInfo.billingAddress && (
              <div>
                <span className="font-medium">Billing Address:</span>{' '}
                {order.customerInfo.billingAddress}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge
                className={statusColors[order.status]}
                variant="secondary"
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Order Date:</span>{' '}
              {formatDate(order.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {formatDate(order.updatedAt)}
            </div>
            <div>
              <span className="font-medium">Total Amount:</span>{' '}
              {formatCurrency(order.totalAmount)}
            </div>
            {order.notes && (
              <div>
                <span className="font-medium">Notes:</span>{' '}
                {order.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between py-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">{item.productName}</div>
                  {item.selectedSize && (
                    <div className="text-sm text-muted-foreground">
                      Size: {item.selectedSize}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 