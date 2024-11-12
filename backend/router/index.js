const { Router } = require("express");

const passpost = require('../config/passport');

const router = Router();

router
  .use(
    '/static',
    passpost.authenticate("jwt", { session: false }),
    require("./static"))
  .use(
    '/game',
    passpost.authenticate("jwt", { session: false }),
    require("./game"))
  .use(
      '/partner',
      passpost.authenticate("jwt", { session: false }),
      require("./partner"))
  .use(
    '/items',
    passpost.authenticate("jwt", { session: false }),
    require("./items"))

module.exports = router;