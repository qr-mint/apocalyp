import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { connect } from '../api/wallet';
import { VERSION } from './config';

const initialState = {
	access_token: null,
	user: null,
	connector: null
};

export const useWalletStore = create()(
	persist(
		(set) => ({
			...initialState,
			connect: async (body) => {
				await connect(body);
			},
			disconnect: async () => {
				const state = useWalletStore.getState();
				if (state.connector) {
					await state.connector.disconnect(); // Call the TonConnect disconnect function
				}
			},
			setTonConnector: (connector) => {
				set({ connector });
			}
		}),
		{
			name: 'wallet',
			version: VERSION,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({

			}),
		}
	)
);
