//library for HTTP Server setup
const express = require("express");

const fs = require("fs");

const app = express();

//ip address of last client
let lastIp;

//counts requests
let counter = 0;

//HTTP GET
//the counter increases everytime the same ip address requests the resource
app.get("/", function (req, res) {
  const ip = req.socket.remoteAddress;

  const counter = getCounter();
  const increasedCounter = increaseCounter(counter, ip);
  setCounter(increasedCounter);

  const counterHtml = getCounterHtml(increasedCounter);

  res.send(counterHtml);
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

function getCounter() {
  return require("./counter.json");
}

function increaseCounter(counter, ip) {
  counter.calls++;
  const client = counter.clients.find((c) => c.ip === ip);
  if (client) {
    client.calls++;
  } else {
    counter.clients.push({ ip, calls: 1 });
  }
  return counter;
}

function setCounter(counter) {
  fs.writeFileSync("counter.json", JSON.stringify(counter));
}

function getCounterHtml(counter) {
  const lines = [];
  lines.push(`Total calls: ${counter.calls}`);
  lines.push(counter.clients.map((c) => `IP ${c.ip} called: ${c.calls} times`));
  const divs = lines.reduce((acc, l) => acc + `<div>${l}</div>`, "");
  return `<!doctype html><html><body>${divs}</body></html>`;
}
