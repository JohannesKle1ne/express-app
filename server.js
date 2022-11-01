//library for HTTP Server setup
const express = require("express");

const fs = require("fs");

const useragent = require("useragent");

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
  const ip = req.headers["x-forwarded-for"];
  const ip2 = req.socket.remoteAddress;
  const geoip = require("geoip-lite");

  res.send(ip + " | " + ip2);
  return;

  const response = {};

  console.log(ip);
  //geo not working
  if (ip !== "::1") {
    response.geo = geoip.lookup(ip);
  } else {
    response.geo = geoip.lookup("2a01:c22:7206:5301:14f8:7773:c2be:f077");
    console.log(geoip.lookup("10.1.31."));
  }
  response.userAgent = useragent.parse(req.headers["user-agent"]);

  response.browserPlugin = `<div class="banner" style="background: white; 
  position: absolute;">AddBlocker installed</div><div 
  class="banner_ad" style="background: white; color:white; position: absolute; 
  ">AddBlocker installed</div>`;

  const div = jsonToDiv(response);

  const script = fs.readFileSync("./script.js", "utf8");

  const html = wrapInHtml(div, script);
  res.send(html);
});

app.get("/adapt2user", function (req, res) {
  const firefox = fs.readFileSync("./firefox.html", "utf8");
  const chrome = fs.readFileSync("./chrome.html", "utf8");
  const windows = fs.readFileSync("./windows.html", "utf8");
  res.send(windows + chrome);
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
  return `<div style="padding:10px">${text}</div>`;
}

function wrapInHtml(content, script) {
  const scriptHtml = `<script>${script}</script>`;
  return `<!doctype html><html><body>${scriptHtml}${content}</body></html>`;
}

function jsonToDiv(json) {
  if (typeof json === "object" && json != null && !Array.isArray(json)) {
    return Object.entries(json).reduce(
      (acc, [key, value]) => acc + getDiv(`${key}: ${jsonToDiv(value)}`),
      ""
    );
  }
  return json;
}

//browsers started lying about their origins to get around these artificial barriers.
//The UA strings are the result: bloatware, full of useless garbage.

//It is generally a hidden div. It contains a file, like ‘ads.js’, that’s usually the target of adblockers.
// When the ad blocker ‘bites’ the bait, the system releases an ad blocker message alert.
