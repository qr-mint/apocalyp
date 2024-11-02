const prisma = require("../prisma");
const { v4 } = require("uuid");

const paymentOrders = [
  {
    order_no: v4(),
    payment: "aeon",
    amount: "100",
    currency: "usdt",
    token: "usdt",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
  {
    order_no: v4(),
    payment: "aeon",
    amount: "100",
    currency: "usdt",
    token: "usdt",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
  {
    order_no: v4(),
    payment: "arcpay",
    amount: "100",
    currency: "ton",
    token: "ton",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
  {
    order_no: v4(),
    payment: "arcpay",
    amount: "100",
    currency: "ton",
    token: "ton",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
  {
    order_no: v4(),
    payment: "stars",
    amount: "100",
    currency: "stars",
    token: "stars",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
  {
    order_no: v4(),
    payment: "stars",
    amount: "100",
    currency: "stars",
    token: "stars",
    item: { coins: 100, },
    payment_order_id: v4(),
    user_id: 1,
    status: "confirmed",
  },
];

(async () => {
  try {
    for (const order of paymentOrders) {
      await prisma.orders.create({ data: order });
    }
  } catch (err) {
    console.error(err);
  }
})();