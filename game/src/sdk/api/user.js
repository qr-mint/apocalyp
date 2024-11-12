import { apiClient } from './request';

export const getUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data.data;
};
