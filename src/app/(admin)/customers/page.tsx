
import PageHeader from '@/components/PageHeader';

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customer database."
      />
      <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-muted-foreground">Customer Management Area</h3>
        <p className="mt-2 text-muted-foreground">
          This section will display a list of customers with options to view their profiles, order history, and manage their accounts.
          Functionality coming soon.
        </p>
      </div>
    </>
  );
}
