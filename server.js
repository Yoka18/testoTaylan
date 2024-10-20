const express = require("express");
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const {v4:uuidV4} = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req,res) => {
    res.redirect(`/${uuidV4()}`)
});

app.get("/:room", (req,res) => {
    res.render("room", {roomId : req.params.room});
});


io.on("connection", socket => {
    console.log("connected");
    socket.on("join-room", (roomId, userId)=>{
        console.log(userId + " joined room");
        socket.join(roomId)
        // roomId deki herkesde user-connected fonksiyonunu çalıştırır
        socket.to(roomId).emit('user-connected', userId);

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", 
                userId
            )
        })
    });
})



server.listen(3000,"192.168.1.33");
