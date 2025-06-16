'use client';

import PageHeader from '@/components/PageHeader';
import { OrdersTable } from '@/components/orders/OrdersTable';

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="View and manage customer orders."
      />
      <div className="container mx-auto py-6">
        <OrdersTable />
      </div>
    </>
  );
}
