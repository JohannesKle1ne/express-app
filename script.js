//https://www.geeksforgeeks.org/how-to-detect-network-speed-using-javascript/

var userImageLink =
  "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20200714180638/CIP_Launch-banner.png";
var time_start, end_time;

// The size in bytes
var downloadSize = 5616998;
var downloadImgSrc = new Image();

var flag = true;

downloadImgSrc.onload = function () {
  end_time = new Date().getTime();
  if (flag) {
    displaySpeed();
    flag = false;
  }
};
time_start = new Date().getTime();
downloadImgSrc.src = userImageLink;

function displaySpeed() {
  var timeDuration = (end_time - time_start) / 1000;
  var loadedBits = downloadSize * 8;

  /* Converts a number into string
                   using toFixed(2) rounding to 2 */
  var bps = (loadedBits / timeDuration).toFixed(2);
  var speedInKbps = (bps / 1024).toFixed(2);
  var speedInMbps = (speedInKbps / 1024).toFixed(2);

  div = document.createElement("div");
  div.style.cssText += "margin-top:60px";
  div.textContent =
    "Your internet connection speed is: \n" +
    bps +
    " bps\n" +
    speedInKbps +
    " kbps\n" +
    speedInMbps +
    " Mbps\n";
  document.querySelector("body").appendChild(div);
}

if (window.DeviceOrientationEvent) {
  window.addEventListener(
    "deviceorientation",
    function (event) {
      console.log([event.beta, event.gamma]);
      let div = document.getElementById("gyro");
      if (div == null) {
        div = document.createElement("div");
        div.setAttribute("id", "gyro");
        div.style.cssText += "margin-top:20px";
        document.querySelector("body").appendChild(div);
      }
      div.textContent = "device orientation: " + event.beta + " " + event.gamma;
    },
    true
  );
} else {
  alert("DeviceOrientationEvent not found");
}
