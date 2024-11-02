const { Router } = require("express");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const prisma = require('../prisma');
const Response = require('../utils/ApiResponse');
const passpost = require('../config/passport');
const { mainBot } = require("../bot");

const {
  ConvertTonProofMessage,
  CreateMessage,
  SignatureVerify,
} = require("../utils/tonConnect");
const { Address } = require("@ton/core");

const router = Router();

router
  .post("/connect", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      const walletInfo = req.body;
      if (!walletInfo?.connectItems?.tonProof) {
        return res.status(400).send(new Response().ok(0));
      }
      const proof = walletInfo.connectItems.tonProof;
      if (!proof) {
        return res.status(400).send(new Response().ok(0));
      }
      const pubkey = Buffer.from(walletInfo.account.publicKey, "hex");

      const parsedMessage = ConvertTonProofMessage(walletInfo, proof);
      const checkMessage = CreateMessage(parsedMessage);

      const verifyRes = SignatureVerify(
        pubkey,
        checkMessage,
        parsedMessage.Signature
      );
      if (!verifyRes) {
        return res
          .status(400)
          .send(new Response().error("Signature is not valid"));
      }
      const address = Address.parseRaw(walletInfo.account.address);
      const addressInString = address.toString();
      const user = await prisma.users.update({
        data: { address: addressInString },
        where: { id: req.user.id }
      });
      return res.json(new Response().data(user));
    } catch (error) {
      await mainBot.api.sendMessage(406497473, `connect/${error.message}`);
      return res.status(400).json(new Response().error(error.message));
    }
  })
  .get('/', async (req, res) => {
    try {
      if (!req.user.address) {
        return res.json(new Response().error("Wallet is not connect"))
      }
      const res = await axios.get(`https://toncenter.com/api/v2/getAddressBalance/${req.user.address}`, {
        headers: {
          "X-API-Key": process.env.TONCENTER_API_KEY
        }
      });
      return res.data.result;
    } catch (err) {
      await mainBot.api.sendMessage(406497473, `balance/${error.message}`);
      return res.status(400).json(new Response().error(error.message));
    }
  })
  .post("/generate_payload", (req, res) => {
    const uuid = uuidv4();
    // Optionally, you can redirect the user to a different page after logout
    return res.json(new Response().data(uuid));
  });;

module.exports = router;