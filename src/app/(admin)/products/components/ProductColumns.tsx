
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Media, Product } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductColumnsProps {
  onDeleteRequested: (productId: string) => void; 
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL;

export const ProductColumns = ({ onDeleteRequested }: ProductColumnsProps): ColumnDef<Product>[] => {
  
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
    accessorKey: "media",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("media") as Media[] | undefined;
      console.log('Log: images: ', images);
      const placeholderImage = "https://placehold.co/60x60.png";
      let displayImage = placeholderImage;

      if (images && images.length > 0 && images[0]) {
        const imagePath = images[0].url;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          displayImage = imagePath;
          console.log('Log: display images: ', displayImage);
        } else {
          let path = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
          if (path.startsWith('/')) {
            path = path.substring(1); // Remove leading slash if present
          }
          displayImage = `${API_HOST}/${path}`;
          console.log('Log: display images: ', displayImage);
        }
      }
      
      return <Image src={displayImage} alt={row.original.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="product photo" onError={() => (event.currentTarget.src = placeholderImage)} />;
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
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price") as string);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const inStock = row.original.inStock;
      let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (!inStock || stock === 0) badgeVariant = "destructive";
      else if (stock < (row.original.lowStockThreshold || 10) ) badgeVariant = "outline"; 
      else badgeVariant = "default";
      
      return <Badge variant={badgeVariant}>{stock > 0 ? `${stock} units` : (inStock ? `${stock} units` : 'Out of Stock')}</Badge>;
    },
  },
   {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
      const status = row.getValue("status") as Product["status"];
      const variantMap = {
        active: "default",
        draft: "secondary",
        archived: "outline",
        out_of_stock: "destructive"
      } as const;
      return <Badge variant={variantMap[status || "draft"] || "secondary"} className="capitalize">{status?.replace("_", " ") || 'Draft'}</Badge>;
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt") as string).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
                <Link href={`/products/${product.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteRequested(product.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]
};
