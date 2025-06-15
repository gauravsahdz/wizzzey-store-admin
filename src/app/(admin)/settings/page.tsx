
"use client";
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AppSettings } from '@/types/ecommerce';
import { getAppSettings, updateAppSettings } from '@/lib/apiService';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  primaryColor: z.string().optional(), // Example theme setting
  // Add more fields as needed from AppSettings type
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      contactPhone: '',
      primaryColor: '',
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const response = await getAppSettings();
        if (response.type === 'OK' && response.data) {
          form.reset({
            siteName: response.data.siteName,
            siteDescription: response.data.siteDescription,
            contactEmail: response.data.contactEmail,
            contactPhone: response.data.contactPhone || '',
            primaryColor: response.data.themeSettings?.primaryColor || '',
          });
        } else {
          toast({ title: "Error", description: response.message || "Failed to load settings.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not fetch app settings.", variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const payload: Partial<AppSettings> = {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        themeSettings: { primaryColor: data.primaryColor } // Simplified
      };
      const response = await updateAppSettings(payload);
      if (response.type === 'OK') {
        toast({ title: "Success", description: "Settings updated successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to update settings.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
       <>
        <PageHeader title="Application Settings" description="Configure general settings for your Wizzzey store." />
        <Card className="shadow-lg">
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-1/4" /> <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/4" /> <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-1/4" /> <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
        </Card>
       </>
    )
  }


  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Configure general settings for your Wizzzey store."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic site information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl><Input placeholder="Wizzzey" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Description</FormLabel>
                    <FormControl><Textarea placeholder="Your awesome e-commerce store description." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl><Input type="email" placeholder="support@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 234 567 8900" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the appearance of your store (admin panel might not reflect these).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Primary Color (Hex)</FormLabel>
                        <FormControl><Input placeholder="#4B0082" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
