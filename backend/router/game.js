const { Router } = require("express");

const Response = require('../utils/ApiResponse');
const prisma = require("../prisma");
const { mainBot } = require("../bot");

const router = Router();


router
  .get('/levels', async (req, res) => {
    try {
      const gameData = await prisma.game_data.findFirst({
        where: { user_id: req.user.user_id }
      });
      if (!gameData) {
        return res.status(400).json(new Response().error("Game Data is not"));
      }
      const levels = await prisma.level_data.findMany({
        where: {
          user_id: req.user.user_id
        }
      });
      if (levels.length === 0 && gameData) {
        await prisma.level_data.create({
          data: {
            number: 1,
            game_data_id: gameData.id,
            user_id: req.user.user_id,
          }
        });
      }
      return res.json(new Response().data(levels));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `auth/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .put('/level', async (req, res) => {
    try {
      const data = req.body;
      const level = await prisma.level_data.findFirst({
        where: { user_id: req.user.user_id, number: data.number }
      });
      if (level) {
        await prisma.level_data.update({
          data: data,
          where: { id: level.id }
        });
      } else {
        const gameData = await prisma.game_data.findFirst({
          select: { id: true },
          where: { user_id: req.user.user_id }
        });
        await prisma.level_data.create({
          data: { ...data, game_data_id: gameData.id, user_id: req.user.user_id },
        });
      }
      return res.json(new Response().ok(1));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `level/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/data', async (req, res) => {
    try {
      let gameData = await prisma.game_data.findFirst({
        where: { user_id: req.user.user_id }
      });
      if (!gameData) {
        gameData = await prisma.game_data.create({
          data: {
            user_id: req.user.user_id,
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
      }
      if (gameData.attempt_timer) {
        gameData.attempt_timer = gameData.attempt_timer.toString();
      }

      return res.json(new Response().data(gameData));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `data/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .put('/data', async (req, res) => {
    try {
      const body = req.body;
      let data = await prisma.game_data.findFirst({
        where: { user_id: req.user.user_id }
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
  .put('/coins', async (req, res) => {
    try {
      const { coins } = req.body;
      const data = await prisma.game_data.findFirst({
        select: { id: true },
        where: { user_id: req.user.user_id }
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
  .get('/coins', async (req, res) => {
    try { 
      const data = await prisma.game_data.findFirst({
        select: { coins: true },
        where: { user_id: req.user.user_id }
      });
      return res.json(new Response().data(data.coins));
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `coins/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;