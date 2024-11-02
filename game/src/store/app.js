import { create } from 'zustand';
import { VERSION } from './config';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
	error: null,
	loading: true,
	payment: false
};

export const useAppStore = create()(
	persist(
		(set) => ({
			...initialState,
			setError: (error) => {
				set({ error });
			},
			setLoading: (loading) => {
				set({ loading });
			},
			togglePayment: (payment) => {
				set({ payment })
			}
		}),
		{
			name: 'app',
			version: VERSION,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
			}),
		}
	)
);
