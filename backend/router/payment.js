const { Router } = require("express");
const axios = require('axios');
const { v4 } = require("uuid");

const payments = require('../payments/index');
const Response = require('../utils/ApiResponse');
const prisma = require("../prisma");
const { mainBot } = require("../bot");

const router = Router();

const starInUsd = 0.0198;
const coinInStar = 10;

const priceItems = [
  {
    coins: 500
  },
  {
    coins: 1000
  },
  {
    coins: 2000
  },
  {
    coins: 2500
  },
  {
    coins: 3000
  },
  {
    coins: 4000
  },
  {
    coins: 5000
  }
];

const methodPayments = {
  aeon: 'aeon',
  arcpay: 'arcpay',
  stars: 'stars'
};

const tokens = {
  aeon: "usdt",
  arcpay: "ton",
  stars: "stars"
};

const getTonPrice = async () => {
  const res = await axios.get('https://connect.tonhubapi.com/price');
  return res.data.price.usd;
}

const getItemPrice = async (item) => {
  const stars = item.coins / coinInStar;
  const usd = (stars * starInUsd).toFixed(2);
  const tonPrice = await getTonPrice();
  const data = {
    coins: item.coins,
    stars,
    usd,
    ton: (usd / tonPrice).toFixed(2)
  };
  return data;
}

router
  .get('/items', async (req, res) => {
    try {
      const coins = [];
      for (const item of priceItems) {
        const data = await getItemPrice(item);
        coins.push(data);
      }
      return res.json(new Response().data(coins));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `paymentCoins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/:payment/create', async (req, res) => {
    try {
      const { coins, currencyToken, amount } = req.body;
      if (!coins) {
        return res.status(400).json(new Response().error("Price incorrect"));
      }
      
      const paymentName = req.params.payment;
      const payment = payments[paymentName];

      if (!payment) {
        return res.status(400).json(new Response().error(`${payment} is not support!`));
      }
      const imageUrl = `https://game-api.qr-mint.net/images/coin.png`;
      let data;
      const orderNo = v4();
      try {
        await payment.loadKeys();
        data = await payment.create({
          telegramId: req.user.telegram_id,
          amount,
          currencyToken,
          name: `${coins} coins`,
          description: "Game currency",
          imageUrl,
          orderNo
        });
      } catch (err) {
        console.log(err);
        await mainBot.api.sendMessage(406497473, `buyCoins/${err.message}`);
        return res.status(400).json(new Response().error('Failed create'));
      } 
      const order = await prisma.orders.create({
        data: {
          payment: paymentName,
          amount: amount.toString(),
          status: "created",
          currency: currencyToken,
          item: { coins },
          token: tokens[paymentName],
          payment_order_id: data.id,
          user_id: req.user.id,
          order_no: orderNo
        }
      });
      if (paymentName === methodPayments.arcpay) {
        try {
          const transactions = await payment.checkout(data.id, { customerWalletAddress: req.user.address });
          data.transactions = transactions;
        } catch (err) {
          await prisma.orders.update({
            where: { id: order.id },
            data: { status: "cancelled" }
          });
          console.log(err);
          await mainBot.api.sendMessage(406497473, `buyCoins/${err.message}`);
          return res.status(400).json(new Response().error('Failed checkouted'));
        }
      }
      data.order_id = order.id;
      return res.json(new Response().data(data));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `buyCoins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/:payment/confirm/:id', async (req, res) => {
    try {
      const paymentName = req.params.payment;
      const payment = payments[paymentName];
      if (!payment) {
        return res.status(400).json(new Response().error(`${payment} is not support!`));
      }
      const order = await prisma.orders.findFirst({
        select: { payment_order_id: true },
        where: { payment: paymentName, id: parseInt(req.params.id) }
      });
      await payment.confirm(order.payment_order_id, req.body);
      return res.json(new Response().ok(1));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `confirm/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;