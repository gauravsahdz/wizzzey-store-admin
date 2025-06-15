
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FAQ } from "@/types/ecommerce";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createFaq, updateFaq } from "@/lib/apiService";
import React, { useState } from "react";

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
  category: z.string().min(2, "Category is required."),
});

type FaqFormValues = z.infer<typeof faqSchema>;

interface FaqFormProps {
  initialData?: FAQ | null;
}

export default function FaqForm({ initialData }: FaqFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: initialData || {
      question: "",
      answer: "",
      category: "",
    },
  });

  const onSubmit = async (values: FaqFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (initialData) {
        response = await updateFaq(initialData.id, values);
      } else {
        response = await createFaq(values as Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `FAQ ${initialData ? 'updated' : 'created'} successfully.` });
        router.push("/faqs");
        router.refresh();
      } else {
        toast({ title: "Error", description: response.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl><Input placeholder="e.g., What is your return policy?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl><Textarea placeholder="Detailed answer to the question..." {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl><Input placeholder="e.g., Shipping & Returns" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/faqs')} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create FAQ')}</Button>
        </div>
      </form>
    </Form>
  );
}
