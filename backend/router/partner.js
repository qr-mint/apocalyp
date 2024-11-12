const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");

const Response = require('../utils/ApiResponse');
const prisma = require("../prisma");

const router = Router();

function generateReferralCode() {
  return uuidv4().replace(/-/g, "").substring(0, 16); // Генерация UUID
}

router
  .get("/inviteCode", async (req, res) => {
    try {
      let inviteCode = await prisma.invite_codes.findFirst({
        where: { user_id: req.user.user_id }
      });
      if (!inviteCode) {
        inviteCode = await prisma.invite_codes.create({
          data: { user_id: req.user.user_id, code: generateReferralCode() }
        });
      }
      return res.json(new Response().data(inviteCode.code));
    } catch (err) {
      return res.status(400).json(new Response().error(err.message));
    };
  })
  .put("/activate", async (req, res) => {
    try {
      const inviteCode = await prisma.invite_codes.findFirst({
        select: { user_id: true, code: true },
        where: { code: req.query.code }
      });
      if (!inviteCode) {
        return res.json(new Response().ok(0));
      }
      const ref = await prisma.referrals.findFirst({
        where: { invitedId: req.user.user_id }
      });
      if (!ref) {
        await prisma.referrals.create({
          data: { invitedById: inviteCode.user_id, invitedId: req.user.user_id }
        });
      }
      return res.json(new Response().ok(1));
    } catch {
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;