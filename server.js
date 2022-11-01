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
app.get("/whoami", function (req, res) {
  const ip = req.socket.remoteAddress;
  const geoip = require("geoip-lite");

  const ipTest = "207.97.227.239";
  const geo = geoip.lookup(ipTest);
  geo.userAgent = req.headers["user-agent"];

  const result = jsonToHtml(geo);

  console.log(geo);
  console.log(result);

  res.send(result);
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
  lines.push(
    ...counter.clients.map((c) => `IP ${c.ip} called: ${c.calls} times`)
  );
  const divs = lines.reduce((acc, l) => acc + getDiv(l), "");
  return wrapInHtml(divs);
}

function getDiv(text) {
  return `<div>${text}</div>`;
}

function wrapInHtml(content) {
  const script = fs.readFileSync("./script.js", "utf8");
  const scriptHtml = `<script>${script}</script>`;
  return `<!doctype html><html><body>${scriptHtml}${content}</body></html>`;
}

function jsonToHtml(json) {
  if (typeof json === "object" && json != null) {
    if (Array.isArray(json)) {
      return JSON.stringify(json);
    } else {
      divs = Object.entries(json).reduce(
        (acc, [key, value]) => acc + getDiv(`${key}: ${jsonToHtml(value)}`),
        ""
      );
      divs =
        divs +
        `<div class="banner" style="background: white; ">AddBlocker installed</div>`;
      divs =
        divs +
        `<div class="banner_ad" style="background: white; color:white; position: absolute;">AddBlocker installed</div>`;
      return wrapInHtml(divs);
    }
  }
  return json;
}

//browsers started lying about their origins to get around these artificial barriers.
//The UA strings are the result: bloatware, full of useless garbage.

//It is generally a hidden div. It contains a file, like ‘ads.js’, that’s usually the target of adblockers.
// When the ad blocker ‘bites’ the bait, the system releases an ad blocker message alert.
