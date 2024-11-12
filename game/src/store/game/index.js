import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { VERSION } from '../config';

import { 
	getLevels, getData,
	updateData, pushLevel,
	updateCoins, getCoins,
} from '../../api/game';

const initialState = {
	data: null,
	levels: [],
	coins: null
};

export const useGameStore = create()(
	persist(
		(set, get) => ({
			...initialState,
			init: async () => {
				const data = await getData();
				const levels = await getLevels();
				set({ data, levels });
			},
			pushLevel: async (level) => {
				const { levels  } = get();
				const newLevels = levels.reduce((acc, curr) => {
					if (acc.some((l) => l.number === level.number)) {
						return acc;
					}
					return acc.concat(curr);
				}, []);
				set({ levels: newLevels });
				await pushLevel(level);
			},
			updateData: async (values) => {
				const { data } = get();
				set({ data: { ...data, ...values } });
				await updateData(values);
			},
			updateCoins: async (coins) => {
				set({ coins });
				await updateCoins({ coins });
			},
			getCoins: async () => {
				const coins = await getCoins({ coins });
				set({ coins });
			}
		}),
		{
			name: 'auth',
			version: VERSION,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
			}),
		}
	)
);
