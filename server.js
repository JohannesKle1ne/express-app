var express = require("express");
var app = express();

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/s", function (req, res) {
  const ip = req.socket.remoteAddress;
  res.send(`IP: ${ip}`);
});

var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log(`Server running on Port ${port}`);
});
