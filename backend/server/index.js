const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/hello", (req, res) => {
  res.json({ message: "Hello from server!" });
})


// must be at the bottom
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// if you change any code here you need to restart server (ctrl+c, npm start)