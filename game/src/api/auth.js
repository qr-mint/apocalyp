import { apiClient } from './request';

export const auth = async () => {
	const res = await apiClient.post(`/api/auth?${window.Telegram.WebApp.initData}`);

	return res.data.data;
};