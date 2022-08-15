const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3001;


let lastImage;

app.get('/last-canvas', (req, res) => {
  res.json({ data: lastImage });
});

app.get('/send-email', (req, res) => {

});

io.on('connection', (socket)=> {
  console.log("user connected")

  // runs whenever anyone releases their mouse while drawing
  // PUBLIC
  socket.on('canvas-data-public', (data)=> {
    lastImage = data;
    console.log("Received Image Data for public board.")
    socket.broadcast.emit('canvas-data-public', data);   // broadcast -> everyone except sender, emit -> everyone
  });
  
  // runs anytime when somebody sents a message
  // PUBLIC
  socket.on('messages-public', (data)=> {
    console.log("Received Message", data);
    io.emit('messages-public', data);
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