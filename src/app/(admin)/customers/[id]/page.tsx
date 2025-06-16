'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-users';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const customerId = params.id as string;

  const { data: customerData, isLoading, error } = useUser(customerId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Customer Details"
          description="Loading customer information..."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
console.log({customerData, error});
  if (error || !customerData?.data.users[0]) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Customer Details"
          description="Error loading customer information"
        />
        <div className="mt-4 text-center text-red-500">
          {error ? 'Failed to load customer details. Please try again later.' : 'Customer not found.'}
        </div>
      </div>
    );
  }

  const customer = customerData.data.users[0];

  return (
    <>
      <PageHeader
        title="Customer Details"
        description="View and manage customer information"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        }
      />

      <div className="container mx-auto py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <Badge variant="outline" className="mt-2">
                    {customer.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(customer.createdAt)}</span>
                </div>
                {customer.address && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Activity Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TODO: Add customer activity data when available */}
                <div className="text-center text-muted-foreground py-8">
                  <p>Customer activity data will be available soon.</p>
                  <p className="text-sm mt-2">This section will show order history, recent interactions, and other relevant activity.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Cards for Future Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Order history will be available soon.</p>
                <p className="text-sm mt-2">This section will display the customer's recent orders and their status.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Customer notes feature coming soon.</p>
                <p className="text-sm mt-2">This section will allow adding and managing notes about the customer.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 