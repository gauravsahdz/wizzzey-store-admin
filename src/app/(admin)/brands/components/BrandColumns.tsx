
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Brand } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, ExternalLink, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface BrandColumnsProps {
  onDeleteRequested: (brandId: string) => void; 
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL;

export const BrandColumns = ({ onDeleteRequested }: BrandColumnsProps): ColumnDef<Brand>[] => {
  
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
    accessorKey: "logoUrl",
    header: "Logo",
    cell: ({ row }) => {
      const logoUrl = row.getValue("logoUrl") as string | undefined;
      const placeholderImage = "https://placehold.co/80x40.png";
      let displayImage = placeholderImage;

      if (logoUrl) {
        if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
          displayImage = logoUrl;
        } else {
          let path = logoUrl.replace(/\\/g, '/'); // Convert backslashes to forward slashes
          if (path.startsWith('/')) {
            path = path.substring(1); // Remove leading slash if present
          }
          displayImage = `${API_HOST}/${path}`;
        }
      }
      return <Image src={displayImage} alt={row.original.name} width={80} height={40} className="rounded-md object-contain" data-ai-hint="brand logo" onError={(event) => (event.currentTarget.src = placeholderImage)} />;
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
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.getValue("website") as string | undefined;
      return website ? <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">{website} <ExternalLink className="ml-1 h-3 w-3" /></a> : "-";
    }
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
      const brand = row.original;
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
              <Link href={`/brands/${brand.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Details
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href={`/brands/${brand.id}/management`}>
                <Settings className="mr-2 h-4 w-4" /> Manage Brand
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteRequested(brand.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]};
