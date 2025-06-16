import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/ecommerce';
import { api } from '@/lib/api';
import { MOCK_USERS } from '@/lib/mockData';

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  role?: string;
}

export interface UsersResponse {
  data: {
    users: User[];
  };
  pagination: {
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

export function useUsers(params: UsersQueryParams = {}) {
  const {
    page = 1,
    limit = 10,
    name,
    email,
    role = 'User', // Default to fetching customers
  } = params;

  return useQuery<UsersResponse>({
    queryKey: ['users', { page, limit, name, email, role }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        role,
      });

      if (name) searchParams.append('name', name);
      if (email) searchParams.append('email', email);

      const response = await api.get(`/users?${searchParams.toString()}`);
      return response.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery<{ data: { users: User[] } }>({
    queryKey: ['user', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/users?id=${id}`);
        return response.data;
      } catch (error) {
        // Fallback to mock data if API call fails
        const mockUser = MOCK_USERS.find(user => user._id === id);
        if (!mockUser) {
          throw new Error('User not found');
        }
        return { data: { user: mockUser } };
      }
    },
    enabled: !!id,
  });
} 