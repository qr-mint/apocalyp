const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const { mainBot } = require("../bot");
const prisma = require("../prisma");
const socket_connection = require("../utils/socket_connection");

const router = Router();

let socket = null;
let socketIsReady = socket_connection
  .createClient()
  .then((res) => {
    socket = res;
  })
  .catch((err) => {
    console.error("Fatal error (0):", err);
  });

router
  .post("/telegram-bot", async (req, res) => {
    try {
      await mainBot.handleUpdate(req.body);
      res.status(200).json(new Response().ok(1));
    } catch (err) {
      res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/arcpay', async (req, res) => {
    try {
      const data = req.body.data;
      const order = await prisma.orders.findFirst({
        where: { payment_order_id: data.uuid }
      });
      if (data.status === 'received') {
        order.status = "confirmed";
      } else if (data.status === 'cancelled') {
        order.status = "cancelled";
      } else if (data.status === 'failed') {
        order.status = "failed";
      }
      await prisma.orders.update({
        where: { id: order.id },
        data: { status: order.status }
      });
      await socketIsReady;
      socket.emit("order", order);
      res.status(200).json(new Response().ok(1));
    } catch (err) {
      res.status(400).json(new Response().error(err.message));
    }
  })
  .post("/aeon", async (req, res) => {
    try {
      const data = req.body;
      const order = await prisma.orders.findFirst({
        where: { payment_order_id: data.orderNo }
      });
      if (!order) {
        res.status(200).json(new Response().error("Order doesn't exit"));
      }
      if (['COMPLETED', 'DELAY_SUCCESS'].includes(data.orderStatus)) {
        order.status = "confirmed";
      } else if (['CLOSE', 'TIMEOUT'].includes(data.orderStatus)) {
        order.status = "cancelled";
      } else if (['FAILED', 'DELAY_FAILED'].includes(data.orderStatus)) {
        order.status = "failed";
      }
      await prisma.orders.update({
        where: {  id: order.id },
        data: { status: order.status }
      });
      await socketIsReady;
      socket.emit("order", order);
      res.status(200).json(new Response().ok(1));
    } catch (err) {
      res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;
