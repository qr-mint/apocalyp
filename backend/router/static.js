const { Router } = require("express");

const prisma = require("../prisma");
const Response = require('../utils/ApiResponse');
const { mainBot } = require('../bot');

const router = Router();

const checkMemberInChannle = async (username, chatId) => {
  try {
    const res = await mainBot.api.getChatMember('@' + username, chatId);
    return ![ 'left', 'kicked' ].includes(res.status);
  } catch (err) {
    return false;
  }
};

router
  .get('/all', async (req, res) => {
    try {
      const users = await prisma.users.count();
      const orders = (await prisma.orders.groupBy({
        by: ["currency"],
        where: { user_id: req.user.id, status: "confirmed" },
        _count: {
          id: true,
        }
      })).map((order) => ({
        [order.currency]: order._count.id
      }));
      const referrals = await prisma.referrals.count({
        where: { invitedId: req.user.id }
      });
      const levels = await prisma.level_data.count({
        where: { stars: 3, user_id: req.user.id }
      });

      const tgGroup = await checkMemberInChannle("QrMint_Bot", req.user.telegramId);

      const enChannel = await checkMemberInChannle("QRMint", req.user.telegramId);
      const ruChannel = await checkMemberInChannle("qr_mint", req.user.telegramId);

      const socialSubscribed = tgGroup && (enChannel || ruChannel);

      return res.json(new Response().data({ users, orders, referrals, levels, socialSubscribed }));
    } catch (err) {
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;