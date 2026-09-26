import { apiClient } from './client';
import { Product } from '../types/inventory';

export const getProducts = async (page = 1, limit = 20, search = '', categoryId = '') => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) query.append('search', search);
  if (categoryId) query.append('categoryId', categoryId);

  return apiClient<{ data: Product[]; meta: any }>(`/products?${query.toString()}`, {
    method: 'GET',
  });
};
