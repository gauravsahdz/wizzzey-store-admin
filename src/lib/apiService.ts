
// This is an API service that makes actual HTTP requests.
import type {
  Product,
  Category,
  Brand,
  Inventory,
  FAQ,
  PaginatedResponse,
  ApiResponse,
  User,
  Order,
  Customer,
  DiscountCode,
  BlogPost,
  ActivityLog,
  AppSettings,
  LoginPayload,
  SoftInventoryItem, 
  BrandDailyOrderItem, 
  OrderPlacedBatch,
  DashboardStatsData, 
} from '@/types/ecommerce';
import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DISCOUNTS, MOCK_BLOG_POSTS, MOCK_ACTIVITY_LOGS, MOCK_APP_SETTINGS } from '@/lib/mockData'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/api';

// Helper function to simulate API delay - can be removed for real API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch function
async function fetchApi<T>(endpoint: string, options?: RequestInit, isFormData: boolean = false): Promise<T> {
  await delay(100);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && endpoint !== 'auth/login' && endpoint !== 'auth/register') { 
    headers['Authorization'] = `Bearer ${token}`;
  }


  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || 'API request failed with non-JSON response' };
      }
      return { type: 'ERROR', message: errorData.message || `API request failed with status ${response.status}`, data: null } as unknown as T;

    }
    if (response.status === 204) { 
        return { type: 'OK', message: 'Operation successful (No Content)' } as unknown as T;
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`API call failed for endpoint ${endpoint}:`, error);
    return { type: 'ERROR', message: (error as Error).message || 'An unexpected error occurred', data:null } as unknown as T;
  }
}

// Auth API functions
export const loginUser = async (credentials: LoginPayload): Promise<ApiResponse<{ user: User; token: string }>> => {
  return fetchApi<ApiResponse<{ user: User; token: string }>>('auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};


// Product API functions
export const getProducts = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Product, 'products'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<Product, 'products'>>(`products?${queryParams.toString()}`);
};
export const getProductById = async (id: string): Promise<ApiResponse<{product: Product}>> => {
  return fetchApi<ApiResponse<{product: Product}>>(`products?id=${id}`);
};

export const createProduct = async (productDataOrFormData: Product | FormData): Promise<ApiResponse<Product>> => {
  if (productDataOrFormData instanceof FormData) {
    return fetchApi<ApiResponse<Product>>('products', {
      method: 'POST',
      body: productDataOrFormData,
    }, true); 
  } else {
     return fetchApi<ApiResponse<Product>>('products', {
      method: 'POST',
      body: JSON.stringify(productDataOrFormData),
    });
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
  return fetchApi<ApiResponse<Product>>(`products?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};
export const deleteProduct = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`products?id=${id}`, {
    method: 'DELETE',
  });
};

// File Upload function (generic)
export const uploadFiles = async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file)); 
  return fetchApi<ApiResponse<{ urls: string[] }>>('upload/images', { 
    method: 'POST',
    body: formData,
  }, true);
};


// Category API functions
export const getCategories = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Category, 'categories'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<Category, 'categories'>>(`categories?${queryParams.toString()}`);
};
export const getCategoryById = async (id: string): Promise<ApiResponse<{categories:Category[]}>> => {
  return fetchApi<ApiResponse<{categories:Category[]}>>(`categories?id=${id}`);
};
export const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> | FormData): Promise<ApiResponse<Category>> => {
  let body: BodyInit;
  let isFormData = false;
  if (categoryData instanceof FormData) {
    body = categoryData;
    isFormData = true;
  } else {
    body = JSON.stringify(categoryData);
  }
  return fetchApi<ApiResponse<Category>>('categories', {
    method: 'POST',
    body: body,
  }, isFormData);
};
export const updateCategory = async (id: string, categoryData: Partial<Category> | FormData): Promise<ApiResponse<Category>> => {
  let body: BodyInit;
  let isFormData = false;
  if (categoryData instanceof FormData) {
    body = categoryData;
    isFormData = true;
  } else {
    body = JSON.stringify(categoryData);
  }
  return fetchApi<ApiResponse<Category>>(`categories?id=${id}`, {
    method: 'PUT',
    body: body,
  }, isFormData);
};
export const deleteCategory = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`categories?id=${id}`, {
    method: 'DELETE',
  });
};


// Brand API functions
export const getBrands = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Brand, 'brands'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
  return fetchApi<PaginatedResponse<Brand, 'brands'>>(`brands?${queryParams.toString()}`);
};
export const getBrandById = async (id: string): Promise<ApiResponse<{brand: Brand}>> => {
  return fetchApi<ApiResponse<{brand: Brand}>>(`brands/${id}`);
};
export const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Brand>> => {
  return fetchApi<ApiResponse<Brand>>('brands', {
    method: 'POST',
    body: JSON.stringify(brandData),
  });
};
export const updateBrand = async (id: string, brandData: Partial<Brand>): Promise<ApiResponse<Brand>> => {
  return fetchApi<ApiResponse<Brand>>(`brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(brandData),
  });
};
export const deleteBrand = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`brands/${id}`, {
    method: 'DELETE',
  });
};

// Inventory API functions (for Product Stock based on OpenAPI)
export const getInventoryItems = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Inventory, 'inventory'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<Inventory, 'inventory'>>(`inventory?${queryParams.toString()}`);
};
export const getInventoryItemById = async (id: string): Promise<ApiResponse<{inventory: Inventory}>> => {
  return fetchApi<ApiResponse<{inventory: Inventory}>>(`inventory/${id}`);
};
export const createInventoryItem = async (inventoryData: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>): Promise<ApiResponse<Inventory>> => {
  return fetchApi<ApiResponse<Inventory>>('inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  });
};
export const updateInventoryItem = async (id: string, inventoryData: Partial<Inventory>): Promise<ApiResponse<Inventory>> => {
  return fetchApi<ApiResponse<Inventory>>(`inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  });
};
export const deleteInventoryItem = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`inventory/${id}`, {
    method: 'DELETE',
  });
};

// FAQ API functions
export const getFaqs = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<FAQ, 'faqs'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<FAQ, 'faqs'>>(`faqs?${queryParams.toString()}`);
};
export const getFaqById = async (id: string): Promise<ApiResponse<{faq: FAQ}>> => {
  return fetchApi<ApiResponse<{faq: FAQ}>>(`faqs?id=${id}`);
};
export const createFaq = async (faqData: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FAQ>> => {
  return fetchApi<ApiResponse<FAQ>>('faqs', {
    method: 'POST',
    body: JSON.stringify(faqData),
  });
};
export const updateFaq = async (id: string, faqData: Partial<FAQ>): Promise<ApiResponse<FAQ>> => {
  return fetchApi<ApiResponse<FAQ>>(`faqs?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(faqData),
  });
};
export const deleteFaq = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`faqs?id=${id}`, {
    method: 'DELETE',
  });
};


// --- MOCKED APIs for features not in OpenAPI spec ---

// Soft Inventory API functions (Mocked - not in OpenAPI)
export const getSoftInventoryItems = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<SoftInventoryItem, 'softInventoryItems'>> => {
  await delay(300);
  const mockItems: SoftInventoryItem[] = [
    { id: 'soft-1', brandName: 'TechCorp', sku: 'SPX-001', size: 'N/A', color: 'Black', quantity: 50, lastUpdated: new Date().toISOString() },
    { id: 'soft-2', brandName: 'Bookish', sku: 'BGN-001', size: 'Paperback', color: 'Red', quantity: 100, lastUpdated: new Date().toISOString() },
  ];
  return { type: 'OK', data: { softInventoryItems: mockItems }, pagination: {total: mockItems.length, page, limit, totalPages: Math.ceil(mockItems.length/limit), hasNextPage: (page * limit < mockItems.length) , hasPrevPage: page > 1} };
};
export const addSoftInventoryItem = async (itemData: Omit<SoftInventoryItem, 'id' | 'lastUpdated'>): Promise<ApiResponse<SoftInventoryItem>> => {
  await delay(300);
  const newItem: SoftInventoryItem = { ...itemData, id: `soft-${Date.now()}`, lastUpdated: new Date().toISOString() };
  console.log("Mock Add Soft Inventory:", newItem);
  return { type: 'OK', data: newItem, message: 'Soft inventory item added (mocked).' };
};

// Brand Daily Orders API functions (Mocked - not in OpenAPI)
export const getBrandDailyOrders = async (brandId: string, date: string): Promise<ApiResponse<{ orders: BrandDailyOrderItem[] }>> => {
  await delay(300);
  console.log(`Mock API: Fetching daily orders for brand ${brandId} on ${date}`);
  const mockOrders: BrandDailyOrderItem[] = [
    { id: `order-${Date.now()}-1`, sku: 'SKU123', color: 'Red', size: 'M', quantity: 2 },
    { id: `order-${Date.now()}-2`, sku: 'SKU456', color: 'Blue', size: 'L', quantity: 1 },
    { id: `order-${Date.now()}-3`, sku: 'SKU789', size: 'S', quantity: 5 },
  ];
  return { type: 'OK', data: { orders: mockOrders } };
};

export const submitBrandOrdersToPlaced = async (brandId: string, orderIds: string[]): Promise<ApiResponse<{ batch: OrderPlacedBatch }>> => {
  await delay(300);
  console.log(`Mock API: Submitting orders ${orderIds.join(', ')} for brand ${brandId} to Order Placed.`);
  const mockBatch: OrderPlacedBatch = {
    id: `batch-${Date.now()}`,
    brandId,
    submissionDate: new Date().toISOString().split('T')[0],
    items: orderIds.map(id => ({
      originalOrderId: id,
      id: `item-in-batch-${id}`,
      sku: `SKU_FOR_${id.slice(0,6)}`,
      size: 'M',
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
    deliveryStatus: 'Pending',
    createdAt: new Date().toISOString(),
  };
  return { type: 'OK', data: { batch: mockBatch }, message: 'Orders submitted to Order Placed (mocked).' };
};

// Order Placed Batches API functions (Mocked - not in OpenAPI)
export const getOrderPlacedBatches = async (brandId: string, date?: string): Promise<ApiResponse<{ batches: OrderPlacedBatch[] }>> => {
  await delay(300);
  console.log(`Mock API: Fetching order placed batches for brand ${brandId}` + (date ? ` on ${date}` : ''));
  const mockBatches: OrderPlacedBatch[] = [
    { id: `batch-1`, brandId, submissionDate: '2023-10-25', items: [], trackingId: 'TRK123', deliveryStatus: 'Delivered', createdAt: new Date().toISOString() },
    { id: `batch-2`, brandId, submissionDate: '2023-10-26', items: [], deliveryStatus: 'Pending', createdAt: new Date().toISOString() },
  ];
  return { type: 'OK', data: { batches: mockBatches } };
};

export const updateOrderPlacedBatch = async (batchId: string, updateData: Partial<Pick<OrderPlacedBatch, 'trackingId' | 'deliveryStatus'>>): Promise<ApiResponse<OrderPlacedBatch>> => {
  await delay(300);
  console.log(`Mock API: Updating order placed batch ${batchId} with`, updateData);
  const mockUpdatedBatch: OrderPlacedBatch = {
    id: batchId,
    brandId: 'brand-mock-id',
    submissionDate: new Date().toISOString().split('T')[0],
    items: [],
    ...updateData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { type: 'OK', data: mockUpdatedBatch, message: 'Order placed batch updated (mocked).' };
};


// --- END MOCKED APIs ---


// User API functions
export const getUsers = async (page = 1, limit = 10, filters: Record<string,any> = {}): Promise<PaginatedResponse<User, 'users'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<User, 'users'>>(`users?${queryParams.toString()}`);
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  const { password, ...dataToUpdate } = userData;
  return fetchApi<ApiResponse<User>>(`users?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(dataToUpdate),
  });
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
  return fetchApi<ApiResponse<User>>('users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`users?id=${id}`, {
    method: 'DELETE',
  });
};


// Order API functions - Mocked, OpenAPI has no /orders endpoint
export const getOrders = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<Order, 'orders'>> => {
  await delay(300);
  return { type: 'OK', data: { orders: MOCK_ORDERS }, pagination: {total: MOCK_ORDERS.length, page, limit, totalPages: Math.ceil(MOCK_ORDERS.length/limit), hasNextPage: (page * limit < MOCK_ORDERS.length) , hasPrevPage: page > 1} };
};

// Customer API functions - Mocked, OpenAPI has no /customers endpoint
export const getCustomers = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<Customer, 'customers'>> => {
  await delay(300);
  return { type: 'OK', data: { customers: MOCK_CUSTOMERS }, pagination: {total: MOCK_CUSTOMERS.length, page, limit, totalPages: Math.ceil(MOCK_CUSTOMERS.length/limit), hasNextPage: (page * limit < MOCK_CUSTOMERS.length) , hasPrevPage: page > 1} };
};

// DiscountCode API functions - Mocked, OpenAPI has no /discount-codes endpoint
export const getDiscountCodes = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<DiscountCode, 'discountCodes'>> => {
  await delay(300);
  return { type: 'OK', data: { discountCodes: MOCK_DISCOUNTS }, pagination: {total: MOCK_DISCOUNTS.length, page, limit, totalPages: Math.ceil(MOCK_DISCOUNTS.length/limit), hasNextPage: (page * limit < MOCK_DISCOUNTS.length) , hasPrevPage: page > 1} };
};

// BlogPost API functions - Mocked, OpenAPI has no /blog-posts endpoint
export const getBlogPosts = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<BlogPost, 'blogPosts'>> => {
  await delay(300);
  const { MOCK_USERS } = await import('@/lib/mockData'); 
  const enrichedPosts = MOCK_BLOG_POSTS.map(post => {
    const author = MOCK_USERS.find(u => u.id === post.author);
    return { ...post, authorName: author?.name || 'Unknown' };
  });
  return { type: 'OK', data: { blogPosts: enrichedPosts }, pagination: {total: MOCK_BLOG_POSTS.length, page, limit, totalPages: Math.ceil(MOCK_BLOG_POSTS.length/limit), hasNextPage: (page * limit < MOCK_BLOG_POSTS.length) , hasPrevPage: page > 1} };
};

// ActivityLog API functions
export const getActivityLogs = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<ActivityLog, 'activityLogs'>> => {
  await delay(300);
  const { MOCK_USERS: usersForLogs } = await import('@/lib/mockData'); 
  const enrichedLogs = MOCK_ACTIVITY_LOGS.map(log => {
    const user = usersForLogs.find(u => u.id === log.userId);
    return { ...log, user };
  });
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLogs = enrichedLogs.slice(startIndex, endIndex);

  return { type: 'OK', data: { activityLogs: paginatedLogs }, pagination: {total: MOCK_ACTIVITY_LOGS.length, page, limit, totalPages: Math.ceil(MOCK_ACTIVITY_LOGS.length/limit), hasNextPage: (page * limit < MOCK_ACTIVITY_LOGS.length) , hasPrevPage: page > 1} };
};


// AppSettings API functions - Mocked as endpoint is not in OpenAPI spec
export const getAppSettings = async (): Promise<ApiResponse<AppSettings>> => {
  await delay(300);
  return { type: 'OK', data: MOCK_APP_SETTINGS };
};
export const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> => {
  await delay(300);
  const updatedSettings = { ...MOCK_APP_SETTINGS, ...settingsData, updatedAt: new Date().toISOString() };
  return { type: 'OK', data: updatedSettings, message: 'Settings updated successfully' };
};

// --- DASHBOARD STATS ---
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStatsData>> => {
    // This function would ideally hit a real backend endpoint like /api/dashboard/stats
    // For now, we'll mock the response structure.
    await delay(500); 
    // const mockData: DashboardStatsData = {
    //   todayStats: {
    //     orders: Math.floor(Math.random() * 50),
    //     revenue: Math.floor(Math.random() * 5000) + 500,
    //   },
    //   overallStats: {
    //     totalOrders: Math.floor(Math.random() * 10000) + 1000,
    //     totalRevenue: Math.floor(Math.random() * 200000) + 50000,
    //     totalCustomers: Math.floor(Math.random() * 2000) + 500,
    //   },
    //   salesOverview: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
    //     date: month, // In real API, this would be a proper date string
    //     revenue: Math.floor(Math.random() * 15000) + 5000,
    //     orders: Math.floor(Math.random() * 100) + 20,
    //   })),
    //   topSellingProducts: [
    //     { productId: 'prod-1', productName: 'Smartphone X', totalQuantity: Math.floor(Math.random()*100), totalRevenue: Math.floor(Math.random()*10000) },
    //     { productId: 'prod-2', productName: 'Laptop Pro', totalQuantity: Math.floor(Math.random()*80), totalRevenue: Math.floor(Math.random()*15000) },
    //     { productId: 'prod-4', productName: 'Wireless Headphones', totalQuantity: Math.floor(Math.random()*150), totalRevenue: Math.floor(Math.random()*7000) },
    //   ],
    // };
    // return { type: 'OK', data: mockData, message: "Dashboard stats fetched (mocked)." };
    return fetchApi<ApiResponse<DashboardStatsData>>('dashboard/stats');
};
