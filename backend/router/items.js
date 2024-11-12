const { Router } = require("express");
const axios = require('axios');

const Response = require('../utils/ApiResponse');
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
  .get('/', async (req, res) => {
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
  });

module.exports = router;