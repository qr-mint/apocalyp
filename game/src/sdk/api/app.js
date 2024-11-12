import { apiClient } from "./request";

export const generateKey = async (publicKey) => {
  const res = await apiClient.post("/apps/generate/" + publicKey);
  return res.data.data;
};