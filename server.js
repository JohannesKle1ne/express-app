//library for HTTP Server setup
const express = require("express");

//library for access to file system
const fs = require("fs");

//parses user agent from request
const useragent = require("useragent");

//rest api library
const app = express();

//ip address of previous clients
let ips = [];

//HTTP GET
//the counter increases everytime the same ip address requests the resource
app.get("/", function (req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const currentdate = new Date();
  const datetime =
    currentdate.getDate() +
    "." +
    (currentdate.getMonth() + 1) +
    "." +
    currentdate.getFullYear() +
    "   " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();

  const counter = require("./counter.json");
  const increasedCounter = increaseCounter(counter, ip);
  setCounter(increasedCounter);

  res.send(getCounterHtml(datetime, increasedCounter));
});

//HTTP GET
//returns information about the client
app.get("/whoami", function (req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geoip = require("geoip-lite");

  const response = {};

  response.geo = geoip.lookup(ip);

  response.ip = ip;

  response.userAgent = useragent.is(req.headers["user-agent"]);

  response.browserPlugin = `<div class="banner" style="background: white; 
  position: absolute;">AddBlocker installed</div><div 
  class="banner_ad" style="background: white; color:white; position: absolute; 
  ">AddBlocker installed</div>`;

  const div = jsonToDiv(response);

  const script = fs.readFileSync("./script.js", "utf8");

  res.send(`<script>${script}</script>` + div);
});

//HTTP GET
//returns different results for different users
app.get("/adapt2user", function (req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const userAgent = useragent.is(req.headers["user-agent"]);

  const firefox = fs.readFileSync("./firefox.html", "utf8");
  const chrome = fs.readFileSync("./chrome.html", "utf8");
  const windows = fs.readFileSync("./windows.html", "utf8");
  const android = fs.readFileSync("./android.html", "utf8");
  let response = "";
  if (!ips.includes(ip)) {
    ips.push(ip);
    response += getDiv("Hi for the first time!");
  }
  if (userAgent.android) {
    response += android;
  } else {
    response += windows;
  }
  if (userAgent.chrome) {
    response += chrome;
  }
  if (userAgent.firefox) {
    response += firefox;
  }

  res.send(response);
});

//start server
const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log(`Server running on Port ${port}`);
});

//increases the counter in of one client in the json
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

//writes new ip counter json to storage
function setCounter(counter) {
  fs.writeFileSync("counter.json", JSON.stringify(counter));
}

//returns html to display current counter
function getCounterHtml(date, counter) {
  const lines = [];
  lines.push(date);
  lines.push(`Total calls: ${counter.calls}`);
  lines.push(
    ...counter.clients.map((c) => `IP ${c.ip} called: ${c.calls} times`)
  );
  return lines.reduce((acc, l) => acc + getDiv(l), "");
}

//wraps text in div
function getDiv(text) {
  return `<div style="padding:10px">${text}</div>`;
}

//creates divs from json
function jsonToDiv(json) {
  if (typeof json === "object" && json != null && !Array.isArray(json)) {
    return Object.entries(json).reduce(
      (acc, [key, value]) => acc + getDiv(`${key}: ${jsonToDiv(value)}`),
      ""
    );
  }
  return json;
}
