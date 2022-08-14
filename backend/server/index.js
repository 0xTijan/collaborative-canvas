const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server, {cors: {origin: "*"}});

const PORT = process.env.PORT || 3001;


app.get('/hello', (req, res) => {
  res.json({ message: "Hello from server!" });
});

io.on('connection', (socket)=> {
  console.log('User Online');

  socket.on('canvas-data', (data)=> {
    console.log("data: ", data)
    socket.broadcast.emit('canvas-data', data);   // broadcast -> everyone except sender, emit -> everyone
  })
})


// must be at the bottom
server.listen(PORT, () => {
  console.log('listening on: ', PORT);
});

// if you change any code here you need to restart server (ctrl+c, npm start)