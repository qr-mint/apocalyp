import { apiClient } from "./request";

export const getLevels = async () => {
  const res = await apiClient.get('/api/levels');
  return res.data.data;
};

export const pushLevel = async (body) => {
  const res = await apiClient.put('/api/level', body);
  return res.data.data;
};

export const updateData = async (body) => {
  const res = await apiClient.put('/api/data', body, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.data.data;
};

export const getData = async () => {
  const res = await apiClient.get('/api/data');
  return res.data.data;
};

export const updateCoins = async (body) => {
  const res = await apiClient.put('/api/coins', body);
  return res.data.data;
};

export const getCoins = async () => {
  const res = await apiClient.get('/api/coins');
  return res.data.data;
};