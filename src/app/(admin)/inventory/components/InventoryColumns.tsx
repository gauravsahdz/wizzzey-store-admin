
"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Inventory } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deleteInventoryItem } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";

interface InventoryColumnsProps {
  onEdit: (item: Inventory) => void;
  onDelete: (itemId: string) => void;
}

export const InventoryColumns = ({ onEdit, onDelete }: InventoryColumnsProps): ColumnDef<Inventory>[] => {
  const { toast } = useToast();

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      const response = await deleteInventoryItem(itemId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Inventory item deleted successfully." });
        onDelete(itemId); // Trigger refresh
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete item.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
  };
  
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
    accessorKey: "productId", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Product ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("productId")
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => `${row.getValue("quantity")} units`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Inventory["status"];
      const variantMap = {
        InStock: "default",
        LowStock: "outline", 
        OutOfStock: "destructive",
      } as const;
      return <Badge variant={variantMap[status] || "secondary"} className="capitalize">{status}</Badge>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({row}) => row.getValue("location") || "-"
  },
  {
    accessorKey: "minQuantity",
    header: "Min Qty",
    cell: ({row}) => row.getValue("minQuantity") ?? "-"
  },
  {
    accessorKey: "maxQuantity",
    header: "Max Qty",
    cell: ({row}) => row.getValue("maxQuantity") ?? "-"
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => new Date(row.getValue("lastUpdated") as string).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]};
