import { apiClient } from './request';

export const connect = async (body) => {
	const res = await apiClient.post(`/api/wallet/connect`, body);
	return res.data.data;
};

export const generatePayload = async () => {
	const res = await apiClient.post('/api/wallet/generate_payload');
	return res.data.data;
};

export const walletBalance = async () => {
	const res = await apiClient.get('/api/wallet');
	return res.data.data;
};