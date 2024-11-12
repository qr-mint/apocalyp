import { apiClient } from "./request";

export const getUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data.data;
};

export const create = async ({ payment, ...body }) => {
  const res = await apiClient.post(`/payments/${payment}/create`, body);
  return res.data.data;
};

export const confirm = async (payment, id, body) => {
  const res = await apiClient.post(`/payments/${payment}/confirm/${id}`, body);
  return res.data.data;
};

export const orders = async (payment) => {
  const res = await apiClient.get(`/payments/${payment}/orders`);
  return res.data.data;
};

export const getPaymentStatic = async () => {
  const res = await apiClient.get(`/payments/static`);
  return res.data.data;
};

export const auth = async (publicKey) => {
	const res = await apiClient.post(`/auth/telegram?${window.Telegram.WebApp.initData}`,{},{
		headers: {
			"x-public-key": publicKey,
		}
	});

	return res.data.data;
};

export const generateKey = async (publicKey) => {
  const res = await apiClient.post("/apps/generate/" + publicKey);
  return res.data.data;
};