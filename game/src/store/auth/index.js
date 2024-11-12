import { create } from 'zustand';
import { VERSION } from '../config';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth } from '../../sdk/api/auth';
import { generateKey } from '../../sdk/api/app';

const initialState = {
	access_token: null,
	connector: null
};

export const useAuthStore = create()(
	persist(
		(set) => ({
			...initialState,
			auth: async () => {
				const publicKey = await generateKey(process.env.PUBLIC_KEY);
				const access_token = await auth(publicKey);
				set({ access_token });
			}
		}),
		{
			name: 'auth',
			version: VERSION,
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				user: state.user,
			}),
		}
	)
);
