const { Router } = require("express");
const Response = require('../utils/ApiResponse');
const { mainBot } = require("../bot");

const socket_connection = require("../utils/socket_connection");

let socket = null;
let socketIsReady = socket_connection
  .createClient()
  .then((res) => {
    socket = res;
  })
  .catch((err) => {
    console.error("Fatal error (0):", err);
  });

const router = Router();

router
  .post('/emit', async (req, res) => {
    try {
      const { name, data } = req.body;
      await socketIsReady;
      socket.emit(name, data);
      return res.json(new Response().ok(1));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `paymentCoins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;