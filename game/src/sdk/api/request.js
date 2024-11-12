import axios from 'axios';
import { useAuthStore } from '../../store/auth';

export const apiClient = axios.create({
	baseURL: "https://api.dev.qr-mint.net",
	withCredentials: true,
	timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
	const { access_token } = useAuthStore.getState();
	if (access_token) {
		const headers = {
			Authorization: `Bearer ${access_token}`,
			'Content-Type': 'application/json'
		};
		config.headers = headers;
	}
	return config;
});


apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (!error) return;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const { auth, access_token } = useAuthStore.getState();
			try {
				await auth();
				if (access_token) {
					const headers = {
						Authorization: `Bearer ${access_token}`,
						'Content-Type': 'application/json'
					};
					originalRequest.headers = headers;
				}
				return apiClient(originalRequest);
			} catch (err) {
				await auth();
				return Promise.resolve(err);
			}
		} else if (error.response?.status === 406) {
			await auth();
			return Promise.resolve(error);
		} else {
			return Promise.reject(error);
		}
	},
);
