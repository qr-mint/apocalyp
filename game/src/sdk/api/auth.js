import { apiClient } from './request';

export const auth = async (publicKey) => {
	const res = await apiClient.post(`/auth/telegram?${window.Telegram.WebApp.initData}`,{},{
		headers: {
			"x-public-key": publicKey,
		}
	});

	return res.data.data;
};

