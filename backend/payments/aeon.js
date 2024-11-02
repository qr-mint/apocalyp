const axios = require('axios');
const crypto = require('crypto');
const { Payments } = require("./payments");

class Aeon extends Payments {
  constructor () {
    super("aeon");
    this.url = process.env.AEON_URL;
  }

  async create (data) {
    try {
      const body = this.createRequestBody(data);
      const res = await axios.post(`${this.url}/open/api/tg/payment/V2`, body);
      if (res.data.error) {
        throw new Error(res.data.msg);
      }
      const model = res.data.model;
      return { id: model.orderNo, url: model.webUrl  }
    } catch (err) {
      throw new Error(err?.msg || err?.message);
    }
  }

  createRequestBody ({ amount, orderNo }) {
    const data = {
      appId: this.apiKey,
      merchantOrderNo: orderNo,
      orderAmount: parseFloat(1),
      payCurrency: "USD",
      paymentTokens: "USDT",
      userId: this.email,
    };
    const signature = this.sign(data);
    data.sign = signature;
    data.tgModel = "MINIAPP";
    data.expiredTime = 1800;
    data.callbackURL = `${process.env.BASE_HOST}/webhook/aeon`;
    data.orderModel = "ORDER";
    return data;
  }

  sign(data) {
    // Сортируем ключи объекта по алфавиту
    const sortedKeys = Object.keys(data).sort();
  
    // Создаём строку в формате URL-запроса
    const queryString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const stringToSign = `${queryString}&key=${this.privateKey}`;
  
    return crypto.createHash('sha512')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();
  }
}

module.exports = Aeon;