
// Based on OpenAPI specification components.schemas

export interface User {
  id: string; // uuid
  name: string;
  email: string; // email
  role: 'Admin' | 'User';
  avatarUrl?: string; // uri
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
  password?: string; // Not in schema but likely for creation
}

export interface Media {
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

export interface Product {
  id: string; // uuid
  name: string;
  description: string;
  price: number;
  categoryId: string; // uuid
  brandId?: string; // uuid
  imageUrl: string; // uri
  inStock: boolean;
  sku?: string;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  availableSizes?: string[];
  colors?: { name: string; code: string }[];
  weight?: { value: number; unit: 'g' | 'kg' | 'lb' | 'oz' };
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'm' | 'in' };
  tags?: string[];
  status?: 'draft' | 'active' | 'archived' | 'out_of_stock';
  isFeatured?: boolean;
  seo?: { title: string; description: string; keywords: string[] };
  ratings?: { average: number; count: number };
  barcode?: string;
  media?: { url: string; type: 'image' | 'video'; alt: string }[];
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Category {
  id: string; // uuid
  name: string;
  description?: string;
  parentId?: string | null; // uuid
  imageUrl?: string; // uri
  slug?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
  seo?: { title?: string; description?: string; keywords?: string[] };
  attributes?: CategoryAttribute[];
  media?: { url: string; type: 'image' | 'video'; alt?: string }[];
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}

export interface OrderItem {
  productId: string; // uuid
  sku?: string; // Added for Brand Orders display
  color?: string; // Added for Brand Orders display
  size?: string; // Added for Brand Orders display
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Order {
  id: string; // uuid
  customerId: string; // uuid
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface FAQ {
  id: string; // uuid
  question: string;
  answer: string;
  category: string;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Inventory {
  id: string; // uuid
  productId: string; // uuid
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  lastUpdated?: string; // date-time
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface AppSettings {
  id: string; // uuid
  siteName: string;
  siteDescription: string;
  contactEmail: string; // email
  contactPhone?: string;
  socialLinks?: {
    facebook?: string; // uri
    twitter?: string; // uri
    instagram?: string; // uri
  };
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  updatedAt?: string; // date-time
}

export interface ActivityLog {
  id: string; // uuid
  userId: string; // uuid
  action: string;
  entityType: string;
  entityId: string; // uuid
  details?: object;
  createdAt?: string; // date-time
  user?: User; // For displaying user name (client-side enrichment)
}

export interface BlogPost {
  id: string; // uuid
  title: string;
  content: string;
  author: string; // uuid (User ID)
  authorName?: string; // For display
  tags?: string[];
  status: 'Draft' | 'Published' | 'Archived';
  featuredImage?: string; // uri
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface CustomerAddress {
  type: 'Billing' | 'Shipping';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Customer {
  id: string; // uuid
  userId?: string; // uuid
  firstName: string;
  lastName: string;
  email: string; // email
  phone?: string;
  addresses?: CustomerAddress[];
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface DiscountCode {
  id: string; // uuid
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string; // date-time
  endDate: string; // date-time
  isActive: boolean;
  usageLimit?: number;
  usageCount?: number;
  appliesTo?: 'All' | 'Products' | 'Categories';
  productIds?: string[]; // uuid array
  categoryIds?: string[]; // uuid array
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Notification {
  id: string; // uuid
  userId: string; // uuid
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  isRead: boolean;
  data?: object;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Brand {
  id: string; // uuid
  name: string;
  description?: string;
  logoUrl?: string; // uri
  website?: string; // uri
  isActive?: boolean;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

// Common API Response Structures
export interface ApiResponse<T = any> {
  type: 'OK' | 'ERROR' | 'SUCCESS'; // Added SUCCESS for the new dashboard stats
  message?: string;
  data?: T;
  meta?: { id?: string }; // uuid
}

export interface PaginatedResponse<TData = any, TKey extends string = string> extends ApiResponse {
  data?: {
    [key in TKey]?: TData[]; // e.g., products: Product[]
  } & { // Allow for single item responses as well, e.g. data.product
    [key as Exclude<TKey, `${TKey}s`>]?: TData;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    applied?: Record<string, any>;
    available?: Record<string, any>;
  };
  sort?: {
    by: string;
    order: 'asc' | 'desc';
  };
}
// API Request Payloads (examples, more can be added as needed)
export interface LoginPayload {
  email: string;
  password?: string; // Password might not always be part of User schema for responses
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

// NEW TYPES FOR ENHANCEMENTS

export interface SoftInventoryItem {
  id: string; // uuid
  brandName: string;
  sku: string;
  size: string;
  color?: string;
  quantity: number;
  lastUpdated: string; // date-time
}

export interface BrandDailyOrderItem {
  id: string; // This is the Order ID
  sku: string;
  color?: string;
  size: string;
  quantity: number;
  rawOrderData?: OrderItem; 
}

export interface OrderPlacedBatchItem extends BrandDailyOrderItem {
  originalOrderId: string;
}
export interface OrderPlacedBatch {
  id: string; // uuid for the batch itself
  brandId: string;
  submissionDate: string; // date string "YYYY-MM-DD"
  items: OrderPlacedBatchItem[];
  trackingId?: string;
  deliveryStatus?: 'Pending' | 'Delivered' | 'Not Delivered' | 'Issue';
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

// Dashboard Stats Types
export interface TodayStats {
  orders: number;
  revenue: number;
}

export interface OverallStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

export interface SalesOverviewItem {
  date: string; // "YYYY-MM-DD"
  revenue: number;
  orders: number;
}

export interface TopSellingProductItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardStatsData {
  todayStats: TodayStats;
  overallStats: OverallStats;
  salesOverview: SalesOverviewItem[];
  topSellingProducts: TopSellingProductItem[];
}

// Add Product `dataAiHint` property
export interface Product {
  // ... existing product properties
  dataAiHint?: string;
}

// Add Category `dataAiHint` property
export interface Category {
  // ... existing category properties
  dataAiHint?: string;
}

// Add Brand `dataAiHint` property
export interface Brand {
  // ... existing brand properties
  dataAiHint?: string;
}

// Add BlogPost `dataAiHint` property
export interface BlogPost {
  // ... existing blog post properties
  dataAiHint?: string;
}
