
"use client";
import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Warehouse, PackagePlus, Layers, ListTree } from 'lucide-react';

export default function InventoryHubPage() {
  return (
    <>
      <PageHeader
        title="Inventory Management Hub"
        description="Manage and track your product stock across different systems."
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/inventory/soft" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Soft Inventory</CardTitle>
              <PackagePlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage stock physically available (Wizzzey internal). Add, view, and track quantities by brand, SKU, size, and color.
              </CardDescription>
              <Button variant="link" className="p-0 mt-2">Go to Soft Inventory &rarr;</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory/hard" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Hard Inventory</CardTitle>
              <Layers className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                View stock information synced from external platforms like Varanga, Amazon, Myntra, etc. (Read-only).
              </CardDescription>
               <Button variant="link" className="p-0 mt-2">Go to Hard Inventory &rarr;</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/inventory/product-stock" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Product Stock Levels</CardTitle>
              <ListTree className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                General overview of product stock based on Product IDs, including min/max thresholds and locations (Uses core Inventory API).
              </CardDescription>
              <Button variant="link" className="p-0 mt-2">View Product Stock &rarr;</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}

    