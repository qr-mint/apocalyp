const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const { rateLimit } = require("express-rate-limit");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const passport = require("./config/passport");
require("./bot");

const app = express();

const server = http.createServer(app);

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

app.set('trust proxy', process.env.MODE === "prod");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);
app.use(cookieParser());
app.use(passport.initialize());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  const origin = req.headers.origin;
  if (process.env.ORIGIN === origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    Object.keys(Object.assign({ "content-type": 1 }, req.headers)).join(",")
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

app
  .use("/webhook", require("./router/webhook"))
  .use("/socket", require("./router/socket"))
  .use("/images", express.static("public/images"))
  .use("/api", require('./router'))
  .get("/*", async (_, res) => {
    return res.status(404).json({ message: "not found", data: null });
  });

server.listen(process.env.GAME_CORE_PORT, (error) => {
  if (error) {
    console.error(error.message);
  } else {
    const addr = server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  }
});
