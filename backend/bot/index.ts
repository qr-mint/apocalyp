import { Bot } from "grammy";

import { BotContext } from "./context";

import { app } from "./routes/index";

class ExtendedBot extends Bot {
  constructor(token: string) {
    super(token, {
      ContextConstructor: BotContext,
      // client: { environment: process.env.MODE === "dev" ? 'test' : 'prod' }
    });
    this.init().then(() => {
      this.use(app);
    });
    if (process.env.MODE === "prod") {
      const url = `${process.env.BASE_HOST}/webhook/telegram-bot`;
      this.api
        .getWebhookInfo()
        .then(async (webhookInfo) => {
          if (webhookInfo.pending_update_count > 0 || webhookInfo.url !== url) {
            await this.api.deleteWebhook({ drop_pending_updates: true });
            await this.api.setWebhook(url);
          }
        })
        .catch(() => {
          process.exit(1);
        });
    } else if (process.env.MODE === "dev") {
      this.start();
    }
  }
}

const token: string = process.env.BOT_TOKEN;

export const mainBot = new ExtendedBot(token);
