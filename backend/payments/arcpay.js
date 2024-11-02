const axios = require('axios');
const { Payments } = require("./payments");

class ArcPay extends Payments {
  constructor () {
    super("arcpay");
    this.url = process.env.ARCPAY_URL;
  }

  async create ({ amount, currencyToken, name, imageUrl, orderNo }) {
    try {
      const data = {
        title: "Apocalypton",
        currency: currencyToken.toUpperCase(),
        orderId: orderNo,
        items: [
          {
            title: name,
            imageUrl,
            price: amount,
            count: 1,
          }
        ],
        captured: true
      };

      const res = await axios.post(`${this.url}/api/v1/arcpay/order`, data, {
        headers: {
          "ArcKey": this.apiKey,
        }
      });

      return { id: res.data.uuid, url: res.data.paymentUrl };
    } catch (err) {
      throw new Error("Failed to create order");
    }
  }

  async checkout (id, body) {
    const res = await axios.post(`${this.url}/api/v1/arcpay/order/${id}/checkout`, body, {
      headers: {
        "ArcKey": this.apiKey,
      }
    });
    return res.data.transactions;
  }

  async confirm (id, body) {
    const res = await axios.post(`${this.url}/api/v1/arcpay/order/${id}/confirm`, body, {
      headers: {
        "ArcKey": this.apiKey,
      }
    });
  
    return res.data;
  }
}

module.exports = ArcPay;

