//library for HTTP Server setup
const express = require("express");

const app = express();

//ip address of last client
let lastIp;

//counts requests
let counter = 0;

//HTTP GET
//the counter increases everytime the same ip address requests the resource
app.get("/", function (req, res) {
  const ip = req.socket.remoteAddress;
  if (ip === lastIp) counter++;
  res.send(`Hello World! called ${counter} times from this ip: ${ip}`);
  lastIp = ip;
});

//HTTP GET
//returns the clinets ip-address
app.get("/s", function (req, res) {
  const ip = req.socket.remoteAddress;
  res.send(`IP: ${ip}`);
});

//access to this "data" ressource is blocked if the client visited the base URL ("/") before
app.get("/data", function (req, res) {
  const ip = req.socket.remoteAddress;
  if (ip === lastIp) {
    res.sendStatus(404);
  } else {
    res.send(`Access granted`);
  }
});

//server creation
//port can be changed for local environment
const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log(`Server running on Port ${port}`);
});
