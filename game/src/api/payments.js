import { apiClient } from "./request";

export const getItems = async () => {
  const res = await apiClient.get(`/api/payments/items`);
  return res.data.data;
}

export const create = async ({ payment, ...body }) => {
  const res = await apiClient.post(`/api/payments/${payment}/create`, body);
  return res.data.data;
};

export const confirm = async (payment, id, body) => {
  const res = await apiClient.post(`/api/payments/${payment}/confirm/${id}`, body);
  return res.data.data;
};
