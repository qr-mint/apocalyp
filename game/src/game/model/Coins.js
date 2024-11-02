import { useAppStore } from "../../store/app";
import { useGameStore } from "../../store/game";

export class Coins {
  constructor(coins) {
    this.totalCoins = coins;
    this.state = useGameStore.getState();
    this.app = useAppStore.getState();
  }

  async set(earnedCoins) {
    try {
      this.totalCoins = this.state.data.coins;
      this.totalCoins = this.totalCoins + earnedCoins;
      await this.state.updateCoins(this.totalCoins);
    } catch(err) {
      this.app.setError(err);
    }
  }

  async get() {
    if (this.totalCoins != null) {
      try {
        await this.state.getCoins()
        this.totalCoins = this.state.data.coins;
        return this.totalCoins;
      } catch (err) {
        this.app.setError(err);
      }
    }
    return this.totalCoins;
  }
}