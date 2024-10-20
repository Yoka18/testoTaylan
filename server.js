const express = require("express");
const app = express();
const fs = require('fs');
const https = require("https"); // HTTP yerine HTTPS kullanıyoruz
const { Server } = require("socket.io");
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", socket => {
  console.log("A user connected");

  socket.on("join-room", (roomId, userId) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    // roomId ve userId'yi soket nesnesine atıyoruz
    socket.roomId = roomId;
    socket.userId = userId;
  });

  socket.on("disconnect", () => {
    if (socket.roomId && socket.userId) {
      socket.to(socket.roomId).emit("user-disconnected", socket.userId);
      console.log(`User ${socket.userId} disconnected from room ${socket.roomId}`);
    }
  });
});

server.listen(3000);
