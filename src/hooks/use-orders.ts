import { useQuery } from '@tanstack/react-query';
import { Order, OrdersQueryParams, PaginatedOrdersResponse } from '@/types/order';
import { api } from '@/lib/api';

export function useOrders(params: OrdersQueryParams = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  return useQuery<PaginatedOrdersResponse>({
    queryKey: ['orders', { page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const response = await api.get(`/orders?${searchParams.toString()}`);
      return response.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery<{ data: { order: Order } }>({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
} 