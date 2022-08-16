const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;

const htmlTemplates = [
  `<h1>Hello World</h1>
  <p>This is a small text</p>
  <p style="color:green;">This is a small green text</p>
  <i>This is italic text</i>
  <button style="background-color:blue;">This is a button</button>`
];

let lastImage;
let lastPublicMessages = [];


app.get('/last-canvas', (req, res) => {
  res.json({ data: lastImage });
});

app.get('/last-messages', (req, res) => {
  let amount = req.query.amount;
  if(amount==undefined || amount >= lastPublicMessages.length) {
    res.json({ messages: lastPublicMessages });
  }else{
    let messagesToReturn = lastPublicMessages.slice(-amount);
    res.json({ messages: messagesToReturn });
  }
});

app.get("/rooms", (req, res) => {
  let roomId = req.query.roomId;
  //this is an ES6 Set of all client ids in the room
  const clients = io.sockets.adapter.rooms.get(roomId);

  //to get the number of clients in this room
  const numClients = clients ? clients.size : 0;
  res.json({ rooms: clients })
});

const getRandomName = () => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});


io.on('connection', (socket)=> {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);
  console.log(users);

  // CREATE ROOM
  socket.on('create-room', async function (room) {
    let roomName = getRandomName();
    socket.join(roomName);
    console.log("joined", socket.rooms);
    socket.emit("joined-room", roomName);
  });

  // JOIN ROOM
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log("joined", socket.rooms);
    socket.emit("joined-room", room);
    //io.to('Room Name').emit('new event', 'Updates');
  });

  // LEAVE ROOM
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log("user left room: ", room);
  });

  socket.on("test", (roomId) => {
    console.log("Emitting: new message, to: ", roomId)
    io.to(roomId).emit("test", "NEw message");
  });

  // ROOM MESSAGES
  socket.on("messages-room", (data) => {
    console.log("in messages-room")
    let { roomId, message } = data;
    console.log("sending ", message, " to: ", roomId);
    io.in(roomId).emit("messages-room", message);
  })

  // PUBLIC CANVAS
  socket.on('canvas-data-public', (data)=> {
    lastImage = data;
    console.log("Received Image Data for public board.")
    socket.broadcast.emit('canvas-data-public', data);   // broadcast -> everyone except sender, emit -> everyone
  });

  // ROOMS Canvas
  socket.on('canvas-rooms', (data)=> {
    const { image, roomId } = data;
    console.log(data)
    //lastImage = image;
    console.log("Received Image Data for public board.")
    io.in(roomId).emit('canvas-rooms', data);   // broadcast -> everyone except sender, emit -> everyone
  });
  
  // PUBLIC MESSAGES
  socket.on('messages-public', (data)=> {
    console.log("Received Message", data);
    io.emit('messages-public', data);
    lastPublicMessages.push(data)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})



// must be at the bottom
server.listen(PORT, () => {
  console.log('listening on: ', PORT);
});

// if you change any code here you need to restart server (ctrl+c, npm start)

