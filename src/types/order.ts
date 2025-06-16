export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedSize?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  shippingAddress: string;
  billingAddress?: string;
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrdersResponse {
  data: {
    orders: Order[];
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 