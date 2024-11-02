import { apiClient } from "./request";

export const getStatic = async () => {
  const res = await apiClient.get("/api/static/all");
  return res.data.data;
};