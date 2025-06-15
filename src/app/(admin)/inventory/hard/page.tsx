
"use client";
import PageHeader from '@/components/PageHeader';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, ShoppingBag } from 'lucide-react'; // Example icons

const externalPlatforms = [
  { name: "Varanga", icon: ShoppingBag, description: "Stock synced from Varanga platform." },
  { name: "Amazon", icon: Server, description: "Inventory levels managed on Amazon Seller Central." },
  { name: "Myntra", icon: ShoppingBag, description: "Product stock details from Myntra." },
  // Add more platforms as needed
];

export default function HardInventoryPage() {
  return (
    <>
      <BackButton defaultHref="/inventory" />
      <PageHeader
        title="Hard Inventory (External Platforms)"
        description="View stock information synced or managed from external platforms."
      />
      <div className="space-y-6">
        <p className="text-muted-foreground">
          This section is intended to display inventory levels that are managed on external e-commerce platforms or ERP systems. 
          Actual data display would require API integrations with each respective platform. Below are placeholders.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalPlatforms.map((platform) => (
            <Card key={platform.name} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{platform.name}</CardTitle>
                <platform.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{platform.description}</p>
                <p className="mt-4 text-xl font-bold text-primary">Data Unavailable</p>
                <p className="text-xs text-muted-foreground">Integration required to fetch live stock.</p>
              </CardContent>
            </Card>
          ))}
        </div>
         <div className="mt-8 p-6 border-2 border-dashed border-muted rounded-lg text-center">
            <h3 className="text-xl font-semibold text-muted-foreground">Future Integrations</h3>
            <p className="mt-2 text-muted-foreground">
                Support for more external platforms will be added in the future.
            </p>
        </div>
      </div>
    </>
  );
}

    