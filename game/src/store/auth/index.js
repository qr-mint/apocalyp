import { create } from 'zustand';
import { VERSION } from '../config';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth } from '../../api/auth';

const initialState = {
	access_token: null,
	connector: null
};

export const useAuthStore = create()(
	persist(
		(set) => ({
			...initialState,
			auth: async () => {
				const access_token = await auth();
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
