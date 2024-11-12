import { apiClient } from './request';

export const connect = async (body) => {
	const res = await apiClient.post(`/wallets/connect`, body);
	return res.data.data;
};

export const generatePayload = async () => {
	const res = await apiClient.post('/wallets/generate_payload');
	return res.data.data;
};

export const walletBalance = async () => {
	const res = await apiClient.get('/wallets/balance');
	return res.data.data;
};