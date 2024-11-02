const { Router } = require("express");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const prisma = require('../prisma');
const { generateHex } = require("../utils/index");
const Response = require('../utils/ApiResponse');
const passpost = require('../config/passport');
const { mainBot } = require("../bot");

const router = Router();
const botToken = process.env.BOT_TOKEN;

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

const refreshTime = process.env.JWT_REFRESH_TOKEN_MAX_LIFETIME_IN_MINUTES;
const accessTime = process.env.JWT_ACCESS_TOKEN_MAX_LIFETIME_IN_MINUTES;

const maxAge = 30 * 60 * 1000;

function generateReferralCode() {
  return uuid.v4().replace(/-/g, "").substring(0, 16); // Генерация UUID
}

router
  .use('/wallet', require('./wallet'))
  .use('/payments', passpost.authenticate("jwt", { session: false }), require('./payment'))
  .use('/static', passpost.authenticate("jwt", { session: false }), require("./static"))
  .post('/auth', async (req, res) => {
    try {
      const { hash, ...query } = req.query;
      const telegram = JSON.parse(query.user);
      const telegramId = telegram.id.toString();
      const sHash = await generateHex(query, botToken);
      if (sHash !== hash) {
        return res.status(400).json(new Response().error("Hash is not"));
      }
      let user = await prisma.users.findFirst({
        select: { id: true },
        where: { telegram_id: telegramId },
      });
      if (user) {
        await prisma.users.update({
          data: { telegram_id: telegramId, username: telegram.username },
          where: { id: user.id }
        });
      } else {
        await prisma.$transaction(async (prisma) => {
          let inviter;
          const code = req.query.code;
          const data = { telegram_id: telegramId, username: telegram.username };
          if (code) {
            inviter = await prisma.users.findFirst({
              select: { id: true, coins: true },
              where: { referralCode: code },
            });
            if (inviter) {
              data.referredById = inviter.id;
            }
            data.referralCode = generateReferralCode();
          }
          user = await prisma.users.create({ data });
          if (inviter) {
            await prisma.referrals.create({
              data: { invitedById: inviter.id, invitedId: user.id },
            });
          }
        });
        const gameData = await prisma.game_data.create({
          data: {
            user_id: user.id,
            lives: 3,
            power_up_count: {
              addMoreMoves: 0,
              universal: 0,
              powerUpRing: 0
            },
            unlocked_badge_data: [],
            unlocked_monster_data: [],
          }
        });
        await prisma.level_data.create({
          data: {
            number: 1,
            game_data_id: gameData.id,
            user_id: user.id,
          }
        })
      }
      const accessToken = jwt.sign(
        { id: user.id, address: user.address },
        jwtAccessSecret,
        {
          expiresIn: accessTime,
        }
      );
      const newRefreshToken = jwt.sign(
        {
          address: user.address,
          id: user.id,
        },
        jwtRefreshSecret,
        { expiresIn: refreshTime }
      );
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge,
      });
      return res
        .status(200)
        .json(new Response().data(accessToken));
    } catch (err) {
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/levels', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const levels = await prisma.level_data.findMany({
        where: {
          user_id: req.user.id
        }
      });
      return res.json(new Response().data(levels));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `auth/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .put('/level', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const data = req.body;
      const level = await prisma.level_data.findFirst({
        where: { user_id: req.user.id, number: data.number }
      });
      if (level) {
        await prisma.level_data.update({
          data: data,
          where: { id: level.id }
        });
      } else {
        const gameData = await prisma.game_data.findFirst({
          select: { id: true },
          where: { user_id: req.user.id }
        });
        await prisma.level_data.create({
          data: { ...data, game_data_id: gameData.id, user_id: req.user.id },
        });
      }
      return res.json(new Response().ok(1));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `level/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/data', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const data = await prisma.game_data.findFirst({
        where: { user_id: req.user.id }
      });
      if (data.attempt_timer) {
        data.attempt_timer = data.attempt_timer.toString();
      }
      
      return res.json(new Response().data(data));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `data/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .put('/data', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const body = req.body;
      let data = await prisma.game_data.findFirst({
        where: { user_id: req.user.id }
      });
      if (!data) {
        return res.status(404).json(new Response().error("Game data doesn't exists"));
      }
      data = await prisma.game_data.update({
        where: { id: data.id },
        data: body
      });
      if (data.attempt_timer) {
        data.attempt_timer = data.attempt_timer.toString();
      }
      return res.json(new Response().data(data));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `data/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .put('/coins', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const { coins } = req.body;
      const data = await prisma.game_data.findFirst({
        select: { id: true },
        where: { user_id: req.user.id }
      });
      if (!data) {
        return res.status(404).json(new Response().error("Game data doesn't exists"));
      }
      await prisma.game_data.update({
        data: { coins },
        where: { id: data.id }
      });
      return res.json(new Response().data(data.coins));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `coins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/coins', passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const data = await prisma.game_data.findFirst({
        select: { coins: true },
        where: { user_id: req.user.id }
      });
      return res.json(new Response().data(data.coins));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `coins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;