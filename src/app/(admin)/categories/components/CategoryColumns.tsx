
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CategoryColumnsProps {
  onDeleteRequested: (categoryId: string) => void; 
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL;

export const CategoryColumns = ({ onDeleteRequested }: CategoryColumnsProps): ColumnDef<Category>[] => {

  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string | undefined;
      const placeholderImage = "https://placehold.co/60x60.png";
      let displayImage = placeholderImage;

      if (imageUrl) {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          displayImage = imageUrl;
        } else {
          let path = imageUrl.replace(/\\/g, '/'); // Convert backslashes to forward slashes
          if (path.startsWith('/')) {
            path = path.substring(1); // Remove leading slash if present
          }
          displayImage = `${API_HOST}/${path}`;
        }
      }
      return <Image src={displayImage} alt={row.original.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="category visual" onError={(event) => (event.currentTarget.src = placeholderImage)} />;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
        const description = row.getValue("description") as string | undefined;
        return <p className="truncate max-w-xs">{description || "-"}</p>;
    }
  },
  {
    accessorKey: "parentId",
    header: "Parent Category",
    // In a real app, you'd fetch parent category name
    cell: ({ row }) => row.getValue("parentId") || "None",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/categories/${category.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteRequested(category.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]};
