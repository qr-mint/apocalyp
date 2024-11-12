const { Payments } = require("./payments");
const { Bot } = require("grammy");

class Stars extends Payments {
  constructor() {
    super("stars");
  }

  async create ({ telegramId, name, description, amount, orderNo }) {
    const prices = [{ label: name, amount }];
    const bot = new Bot(this.token);
    const res = await bot.api.sendInvoice(telegramId, name, description, orderNo, "XTR", prices);
    return { id: res.message_id.toString() }
  }

  async loadKeys (app) {
    const keys = app.payments.find((p) => p.payment === this.name).keys;
    this.telegramId = keys.telegram_id;
    this.token = keys.token;
  }
}

module.exports = Stars;