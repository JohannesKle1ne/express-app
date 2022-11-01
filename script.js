if (window.DeviceOrientationEvent) {
  window.addEventListener(
    "deviceorientation",
    function (event) {
      console.log([event.beta, event.gamma]);
      let div = document.getElementById("gyro");
      if (div == null) {
        div = document.createElement("div");
        document.querySelector("body").appendChild(div);
      }
      div.textContent = event.beta + " " + event.gamma;
    },
    true
  );
} else {
  alert("DeviceOrientationEvent not found");
}
