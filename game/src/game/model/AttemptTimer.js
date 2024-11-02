
export class AttemptTimer {
    constructor(configObj) {
        this.attempt_timer = configObj.attempTimer;
        this.gameState = configObj.gameState;
        this.appState = configObj.appState;
        this.dateObj = new Date();
    }

    getTime() {
        return this.dateObj.getTime();
    }

    setAttemptTimer (time) {
        this.attempt_timer = parseInt(time);
    }

    async updateTime() {
        if (this.attempt_timer != undefined) {
            this.dateObj = new Date();
            this.elapsedTime = this.secondsToTime((this.dateObj.getTime() / 1000) - (this.attempt_timer / 1000));
            await this.setStartTime(this.getTime());
            return this.elapsedTime;
        }
        return null;
    }

    async setStartTime(timeObj) {
        if (this.attempt_timer == null) {
            this.attempt_timer = timeObj;
            try {
                await this.gameState.updateData({ attempt_timer: timeObj });
            } catch (err) {
                this.appState.setError(err.message);
            }
        }
      }

    secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60));
        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);
        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        var obj = {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
    }
}