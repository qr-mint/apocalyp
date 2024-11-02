import { socketEvents } from '../../socket/index';
import { useGameStore } from '../store/game';
import { useAppStore } from '../store/app';

socketEvents.listOrder((order) => {
  useGameStore.getState().updateCoins(order.item.coins);
  useAppStore.getState().togglePayment(false);
});