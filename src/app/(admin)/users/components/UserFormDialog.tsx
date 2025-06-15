
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/types/ecommerce";
import { useToast } from "@/hooks/use-toast";
import { updateUser, createUser } from "@/lib/apiService"; // Added createUser
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Schema now includes an optional password, which we'll make conditionally required in the form
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(["Admin", "User"]),
  avatarUrl: z.string().url("Must be a valid URL for avatar.").optional().or(z.literal("")),
  password: z.string().optional(), // Password is optional in schema, required in form for new users
}).refine(data => {
    // If it's a new user (implied by password being potentially set), password must be at least 6 chars.
    // This refine is a bit tricky because password is optional in the Zod schema itself
    // to allow the form to be used for editing without requiring password change.
    // For actual creation, the form will ensure password is provided.
    if (data.password && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters long.",
    path: ["password"], // specify the path to show the error message
});


type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  userData?: User | null; // For editing
}

export default function UserFormDialog({ isOpen, onClose, userData }: UserFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!userData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "User",
      avatarUrl: "",
      password: "", // Initialize password for the form
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (userData) { // Editing existing user
        form.reset({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "User",
          avatarUrl: userData.avatarUrl || "",
          password: "", // Don't prefill password for editing
        });
      } else { // Adding new user
        form.reset({
          name: "",
          email: "",
          role: "User",
          avatarUrl: "",
          password: "", // Clear password for new user form
        });
      }
    }
  }, [userData, form, isOpen]);


  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (isEditing && userData) { // Editing existing user
        // Password should not be sent if not changed.
        // For simplicity, our current API for PUT /users might ignore password or require it to be explicitly handled.
        // Assuming API ignores password if not provided or is empty.
        const { password, ...updateValues } = values;
        const payload = password && password.trim() !== "" ? values : updateValues;
        response = await updateUser(userData.id, payload);
      } else { // Creating new user
        if (!values.password || values.password.length < 6) {
            form.setError("password", { type: "manual", message: "Password is required and must be at least 6 characters." });
            setIsLoading(false);
            return;
        }
        response = await createUser(values as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `User ${isEditing ? 'updated' : 'created'} successfully.` });
        onClose(true); 
      } else {
        toast({ title: "Error", description: response.message || `Failed to ${isEditing ? 'update' : 'create'} user.`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this user." : "Fill in the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && ( // Only show password field when adding a new user
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormDescription>Minimum 6 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl><Input type="url" placeholder="https://example.com/avatar.png" {...field} /></FormControl>
                  <FormDescription>Provide a direct link to the user's avatar image.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
