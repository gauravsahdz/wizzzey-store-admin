import type { Product, Category, Brand, Inventory, FAQ, Order, User, Customer, DiscountCode, BlogPost, ActivityLog, AppSettings } from '@/types/ecommerce';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', createdAt: new Date().toISOString(), avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'user-2', name: 'Regular User', email: 'user@example.com', role: 'User', createdAt: new Date().toISOString(), avatarUrl: 'https://placehold.co/100x100.png' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics', description: 'Gadgets and devices', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'electronics circuit', createdAt: new Date().toISOString(), parentId: null },
  { id: 'cat-2', name: 'Books', description: 'Read all about it', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'books library', createdAt: new Date().toISOString(), parentId: null },
  { id: 'cat-3', name: 'Smartphones', description: 'Latest mobile phones', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'smartphone mobile', createdAt: new Date().toISOString(), parentId: 'cat-1' },
  { id: 'cat-4', name: 'Laptops', description: 'Powerful computing on the go', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'laptop computer', createdAt: new Date().toISOString(), parentId: 'cat-1' },
];

export const MOCK_BRANDS: Brand[] = [
  { id: 'brand-1', name: 'TechCorp', description: 'Leading tech manufacturer', logoUrl: 'https://placehold.co/100x50.png', dataAiHint: 'tech logo', website: 'https://techcorp.example.com', isActive: true, createdAt: new Date().toISOString() },
  { id: 'brand-2', name: 'Bookish', description: 'Your favorite book publisher', logoUrl: 'https://placehold.co/100x50.png', dataAiHint: 'book logo', website: 'https://bookish.example.com', isActive: true, createdAt: new Date().toISOString() },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Smartphone X', description: 'Latest smartphone with AI features', price: 999.99, categoryId: 'cat-3', brandId: 'brand-1', images: ['https://placehold.co/600x400.png', 'https://placehold.co/600x400.png'], dataAiHint: 'smartphone modern', inStock: true, sku: 'SPX-001', stock: 100, createdAt: new Date().toISOString() },
  { id: 'prod-2', name: 'Laptop Pro', description: 'High-performance laptop for professionals', price: 1499.00, categoryId: 'cat-4', brandId: 'brand-1', images: ['https://placehold.co/600x400.png'], dataAiHint: 'laptop professional', inStock: true, sku: 'LPP-001', stock: 50, createdAt: new Date().toISOString() },
  { id: 'prod-3', name: 'The Great Novel', description: 'A captivating story of adventure', price: 19.99, categoryId: 'cat-2', brandId: 'brand-2', images: ['https://placehold.co/600x400.png'], dataAiHint: 'book cover', inStock: false, sku: 'BGN-001', stock: 0, createdAt: new Date().toISOString() },
  { id: 'prod-4', name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones', price: 199.50, categoryId: 'cat-1', brandId: 'brand-1', images: ['https://placehold.co/600x400.png'], dataAiHint: 'headphones audio', inStock: true, sku: 'HDPH-001', stock: 75, createdAt: new Date().toISOString() },
];

export const MOCK_INVENTORY: Inventory[] = [
  { id: 'inv-1', productId: 'prod-1', quantity: 100, minQuantity: 10, maxQuantity: 200, location: 'Warehouse A', status: 'InStock', lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString()},
  { id: 'inv-2', productId: 'prod-2', quantity: 50, minQuantity: 5, maxQuantity: 100, location: 'Warehouse B', status: 'InStock', lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'inv-3', productId: 'prod-3', quantity: 0, minQuantity: 20, maxQuantity: 100, location: 'Warehouse C', status: 'OutOfStock', lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'inv-4', productId: 'prod-4', quantity: 8, minQuantity: 10, maxQuantity: 50, location: 'Warehouse A', status: 'LowStock', lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
];

export const MOCK_FAQS: FAQ[] = [
  { id: 'faq-1', question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase, provided the item is in its original condition.', category: 'Shipping & Returns', createdAt: new Date().toISOString() },
  { id: 'faq-2', question: 'How do I track my order?', answer: 'Once your order ships, you will receive an email with a tracking number and a link to the carrier\'s website.', category: 'Orders', createdAt: new Date().toISOString() },
  { id: 'faq-3', question: 'Do you ship internationally?', answer: 'Yes, we ship to most countries. Shipping costs and times vary by destination.', category: 'Shipping & Returns', createdAt: new Date().toISOString() },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'order-1',
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1, price: 999.99 }],
        status: 'Processing',
        totalAmount: 999.99,
        shippingAddress: { street: '123 Main St', city: 'Anytown', state: 'CA', country: 'USA', zipCode: '90210' },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
        id: 'order-2',
        customerId: 'cust-2',
        items: [
            { productId: 'prod-2', quantity: 1, price: 1499.00 },
            { productId: 'prod-4', quantity: 2, price: 199.50 },
        ],
        status: 'Shipped',
        totalAmount: 1499.00 + (199.50 * 2),
        shippingAddress: { street: '456 Oak Ave', city: 'Otherville', state: 'NY', country: 'USA', zipCode: '10001' },
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', phone: '555-1234', createdAt: new Date().toISOString() },
    { id: 'cust-2', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', phone: '555-5678', createdAt: new Date().toISOString() },
];

export const MOCK_DISCOUNTS: DiscountCode[] = [
    { id: 'disc-1', code: 'SUMMER20', type: 'Percentage', value: 20, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 30).toISOString(), isActive: true, usageLimit: 100, usageCount: 10 },
    { id: 'disc-2', code: 'SAVE10', type: 'Fixed', value: 10, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 60).toISOString(), isActive: true, minPurchase: 50 },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { id: 'blog-1', title: 'Top 5 Tech Trends in 2024', content: 'Detailed content about tech trends...', author: 'user-1', authorName: 'Admin User', status: 'Published', createdAt: new Date().toISOString(), featuredImage: 'https://placehold.co/800x400.png', dataAiHint: 'tech trends' },
    { id: 'blog-2', title: 'A Guide to Mindful Reading', content: 'Explore the benefits of mindful reading...', author: 'user-2', authorName: 'Regular User', status: 'Draft', createdAt: new Date().toISOString(), featuredImage: 'https://placehold.co/800x400.png', dataAiHint: 'reading book' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'log-1', userId: 'user-1', action: 'Created Product', entityType: 'Product', entityId: 'prod-1', details: { name: 'Smartphone X' }, createdAt: new Date().toISOString() },
    { id: 'log-2', userId: 'user-1', action: 'Updated Category', entityType: 'Category', entityId: 'cat-1', details: { oldName: 'Gadgets', newName: 'Electronics' }, createdAt: new Date().toISOString() },
];

export let MOCK_APP_SETTINGS: AppSettings = {
    id: 'settings-1',
    siteName: 'Wizzzey',
    siteDescription: 'Your one-stop e-commerce solution.',
    contactEmail: 'support@wizzzey.com',
    contactPhone: '1-800-555-WIZZ',
    socialLinks: { facebook: 'https://facebook.com/wizzzey', twitter: 'https://twitter.com/wizzzey' },
    themeSettings: { primaryColor: '#4B0082', secondaryColor: '#9ACD32', fontFamily: 'Inter' },
    updatedAt: new Date().toISOString(),
};
