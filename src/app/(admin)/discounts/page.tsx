
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DiscountsPage() {
  return (
    <>
      <PageHeader
        title="Discount Codes"
        description="Create and manage discount codes and promotions."
        actions={
          <Button disabled> {/* Assuming /discounts/new for creation */}
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Discount
          </Button>
        }
      />
      <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-muted-foreground">Discount Management Area</h3>
        <p className="mt-2 text-muted-foreground">
          This section will allow you to create, view, and manage various types of discount codes (percentage, fixed amount, free shipping, etc.).
          Functionality coming soon.
        </p>
      </div>
    </>
  );
}
