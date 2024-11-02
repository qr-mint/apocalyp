const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");

require('dotenv').config();

const socketPort = process.env.SOCKET_PORT;

const app = express();
const server = createServer(app);
const local_io = new Server(server);

local_io.sockets.on("connection", function (socket) {
  var ID = socket.id.toString();
  console.warn("New local client: " + ID);

  socket.join("app", () => {
    console.warn("New app is connected");
    local_io.to("app").emit("warn", "New app is connected");
  });

  socket.on("log", function (data) {
    local_io.to("app").emit("log", data);
  });

  socket.on("warn", function (data) {
    local_io.to("app").emit("warn", data);
  });

  socket.on("order", function (data) {
    local_io.to("app").emit("order", data);
  });

  socket.on("err", function (data) {
    local_io.to("app").emit("err", data);
  });

  socket.on("disconnect", function () {
    console.warn(socket.net_init + " disconnected");
  });
});

server.listen(socketPort, () => {
  console.log("Socket Server: ", socketPort);
});
