const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const PORT = process.env.PORT || 3001;

let lastImage;
let lastPublicMessages = [];
let messages = new Map();

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

const getRandomName = () => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 15; i++)
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

io.of("/").adapter.on("create-room", (room) => {
  const d = new Date();
  let date = `${d.getHours()}:${d.getMinutes()}`
  let _message = {
    sender: "",
    date: date,
    message: `Room was created.`
  }
  messages.set(room, [_message]);
  io.to(room).emit("messages-room", {
    roomId: room,
    message: _message
  });
  console.log(`Private room with id ${room}.`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  const d = new Date();
  let date = `${d.getHours()}:${d.getMinutes()}`;
  let socket = io.sockets.sockets.get(id);
  let newMessage = {
    sender: "",
    date: date,
    message: `${socket.username} has joined.`
  }
  let _messages = messages.get(room);
  messages.set(room, [..._messages, newMessage]);
  io.to(room).emit("messages-room", {
    roomId: room,
    message: newMessage
  })
  console.log(`socket ${socket.username} has joined room ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
  const d = new Date();
  let date = `${d.getHours()}:${d.getMinutes()}`;
  let socket = io.sockets.sockets.get(id);
  io.to(room).emit("messages-room", {
    roomId: room,
    message: {
      sender: "",
      date: date,
      message: `${socket.username} has left.`
    }
  })
  console.log(`socket ${id} has left room ${room}`);
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
    if (io.sockets.adapter.rooms.has(room)) {
      socket.join(room);
      console.log("joined", socket.rooms);
      socket.emit("joined-room", room);
    } else {
      socket.emit("errors", "Cannot join. Room doesn't exist!");
    };
  });

  // LEAVE ROOM
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log("user left room: ", room);
  });

  // ROOM MESSAGES
  socket.on("messages-room", (data) => {
    console.log("in messages-room")
    let { roomId, message } = data;
    console.log("sending ", message, " to: ", roomId);
    io.in(roomId).emit("messages-room", data);
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

// delete room: https://stackoverflow.com/questions/23342395/how-to-delete-a-room-in-socket-io