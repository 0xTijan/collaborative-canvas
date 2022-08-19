const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const PORT = process.env.PORT || 3001;


let imagesMap = new Map();
let messagesMap = new Map([]);


let lastImage;
let lastPublicMessages = [];
let messages = new Map();

const pushMessage = (roomId, message) => {
  let _messages = messagesMap.get(roomId);
  messagesMap.set(roomId, [..._messages, message]);
}

const pushImage = (roomId, image) => {
  imagesMap.set(roomId, image)
}


app.get('/last-canvas', (req, res) => {
  const room = req.query.roomId;
  const _lastImage = imagesMap.get(room);
  res.json({ data: lastImage });
});

app.post("/send-email", (req, res) => {
  const to = req.body.to;
  console.log("Send to: ", to);
});

app.get('/last-messages', (req, res) => {
  const room = req.query.roomId;
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

  for (let i = 0; i < 20; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username || username.length<1) {
    return next(new Error("Invalid Nickname!"));
  }
  const users = [];
  let alreadyTaken = false;
  for (let [id, _socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: _socket.username,
    });
    if(_socket.username.toLowerCase() == username.toLowerCase()) {
      alreadyTaken = true;
    }
  }
  if(alreadyTaken) {
    console.log("Username already taken!");
    return next(new Error("Nickname Already Taken!"));
  }
  socket.username = username;
  next();
});

io.of("/").adapter.on("create-room", (room) => {
  const d = new Date();
  let minutes = d.getMinutes()<10 ? `0${d.getMinutes()}`:d.getMinutes();
  let date = `${d.getHours()}:${minutes}`
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
  let minutes = d.getMinutes()<10 ? `0${d.getMinutes()}`:d.getMinutes();
  let date = `${d.getHours()}:${minutes}`
  let socket = io.sockets.sockets.get(id);
  let newMessage = {
    sender: "",
    date: date,
    message: `${socket.username} has joined.`
  }
  let _messages = messages.get(room);
  messages.set(room, [..._messages, newMessage]);
  if(room=="public") {
    lastPublicMessages.push(newMessage);
  }
  io.to(room).emit("messages-room", {
    roomId: room,
    message: newMessage
  })
  let members =  io.sockets.adapter.rooms.get(room).size;
  io.to(room).emit("members", members)
  console.log(`socket ${socket.username} has joined room ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
  const d = new Date();
  let minutes = d.getMinutes()<10 ? `0${d.getMinutes()}`:d.getMinutes();
  let date = `${d.getHours()}:${minutes}`
  let socket = io.sockets.sockets.get(id);
  let newMessage = {
    sender: "",
    date: date,
    message: `${socket.username} has left.`
  };
  io.to(room).emit("messages-room", {
    roomId: room,
    message: newMessage
  });
  if(room=="public") {
    lastPublicMessages.push(newMessage);
  }
  let members =  io.sockets.adapter.rooms.get(room).size;
  io.to(room).emit("members", members)
  console.log(`socket ${id} has left room ${room}`);
});

io.on('connection', (socket)=> {
  const users = [];
  for (let [id, _socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: _socket.username,
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
    /*const data = {
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAgICAwICAgMDAwMEBgQEBAQECAYGBQYJCAoKCQgJCQoMDwwKCw4LCQkNEQ0ODxAQERAKDBITEhATDxAQEP/bAEMBAwMDBAMECAQECBALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/AABEIAAoACgMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqmAD/9k=",
      roomId: room,
    }
    socket.emit("canvas-rooms", data);*/
  });

  // JOIN ROOM
  socket.on("join-room", (room) => {
    if (io.sockets.adapter.rooms.has(room)) {
      socket.join(room);
      console.log("joined", socket.rooms);
      socket.emit("joined-room", room);
      let members =  io.sockets.adapter.rooms.get(room).size;
      console.log("members: ", members)
      io.to(room).emit("members", members)
    } else if(room=="public") {
      socket.join(room);
      console.log("joined", socket.rooms);
      socket.emit("joined-room", room);
      let members =  io.sockets.adapter.rooms.get(room).size;
      console.log("members: ", members)
      io.to(room).emit("members", members)
    } else {
      socket.emit("errors", "Cannot join. Room doesn't exist!");
    }
  });

  // GET ROOM MEMBERS
  socket.on("get-num-of-members", (room) => {
    if(io.sockets.adapter.rooms.get(room)) {
      let members =  io.sockets.adapter.rooms.get(room).size;
      io.to(room).emit("members", members);
    }else{
      io.to(room).emit("members", "-");
    }
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
    if(roomId=="public") {
      lastPublicMessages.push(message);
    }
    io.in(roomId).emit("messages-room", data);
  })

  // ROOMS Canvas
  socket.on('canvas-rooms', (data)=> {
    const { image, roomId } = data;
    console.log(data)
    if(roomId=="public") {
      lastImage = image;
    }
    io.in(roomId).emit('canvas-rooms', data);   // broadcast -> everyone except sender, emit -> everyone
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})



// must be at the bottom
server.listen(PORT, () => {
  console.log('listening on: ', PORT);
});