const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server, {cors: {origin: "*"}});

const PORT = process.env.PORT || 3001;


let lastImage;

app.get('/last-canvas', (req, res) => {
  res.json({ data: lastImage });
});

io.on('connection', (socket)=> {
  socket.on('canvas-data', (data)=> {
    lastImage = data;
    socket.broadcast.emit('canvas-data', data);   // broadcast -> everyone except sender, emit -> everyone
  })
})


// must be at the bottom
server.listen(PORT, () => {
  console.log('listening on: ', PORT);
});

// if you change any code here you need to restart server (ctrl+c, npm start)