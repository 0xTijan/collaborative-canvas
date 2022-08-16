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

io.on('connection', (socket)=> {
  console.log("user connected");

  // PUBLIC CANVAS
  socket.on('canvas-data-public', (data)=> {
    lastImage = data;
    console.log("Received Image Data for public board.")
    socket.broadcast.emit('canvas-data-public', data);   // broadcast -> everyone except sender, emit -> everyone
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

/**
 * 
 * 
 * 
app.post("/send-email", async(req, res) => {
  //! is empty!!!
  let { to, subject, htmlTemplateNumber } = req.body;
  console.log(to, subject, htmlTemplateNumber);
  /*let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  }); 

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "CanvasNFT", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: htmlTemplates[htmlTemplateNumber], // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
});
 * 
 */