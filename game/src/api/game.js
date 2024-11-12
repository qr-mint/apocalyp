import { apiClient } from "./request";

export const getLevels = async () => {
  const res = await apiClient.get('/api/game/levels');
  return res.data.data;
};

export const pushLevel = async (body) => {
  const res = await apiClient.put('/api/game/level', body);
  return res.data.data;
};

export const updateData = async (body) => {
  const res = await apiClient.put('/api/game/data', body, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.data.data;
};

export const getData = async () => {
  const res = await apiClient.get('/api/game/data');
  return res.data.data;
};

export const updateCoins = async (body) => {
  const res = await apiClient.put('/api/game/coins', body);
  return res.data.data;
};

export const getCoins = async () => {
  const res = await apiClient.get('/api/game/coins');
  return res.data.data;
};

export const getItems = async () => {
  const res = await apiClient.get('/api/items');
  return res.data.data;
};