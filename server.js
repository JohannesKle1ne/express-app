var express = require("express");
var app = express();

let lastIp;
let counter = 0;

app.get("/", function (req, res) {
  const ip = req.socket.remoteAddress;
  if (ip === lastIp) counter++;
  res.send(`Hello World! called ${counter} times from this ip: ${ip}`);
  lastIp = ip;
});

app.get("/s", function (req, res) {
  const ip = req.socket.remoteAddress;
  res.send(`IP: ${ip}`);
});

app.get("/data", function (req, res) {
  const ip = req.socket.remoteAddress;
  if (ip === lastIp) {
    res.sendStatus(404);
  } else {
    res.send(`Access granted`);
  }
});

var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log(`Server running on Port ${port}`);
});
