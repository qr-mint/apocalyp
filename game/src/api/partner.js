import { apiClient } from "./request";

export const inviteCode = async () => {
  const res = await apiClient.get('/api/partner/inviteCode');
  return res.data.data;
};

export const activate = async (code) => {
  const res = await apiClient.put('/api/partner/activate',{}, {
		params: code ? { code } : {}
	});
  return res.data.data;
};
