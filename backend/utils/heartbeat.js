const { performCleanup } = require("./cleanup");

let lastHeartbeatTime = Date.now();
let intervalId = null;
let cleanupTriggered = false;

const updateHeartbeat = () => {
  lastHeartbeatTime = Date.now();
  cleanupTriggered = false;
  // console.log(
  //   `App activity detected at ${new Date(lastHeartbeatTime).toISOString()}`
  // );
};

const isInactive = (timeout) => {
  return Date.now() - lastHeartbeatTime > timeout;
};

const initializeHeartbeat = (timeout = 15000) => {
  if (intervalId) {
    console.warn("App monitoring already initialized.");
    return;
  }

  intervalId = setInterval(() => {
    if (isInactive(timeout) && !cleanupTriggered) {
      console.log("App appears to have closed. Performing cleanup...");
      performCleanup();
      cleanupTriggered = true;
    }
  }, timeout);

  console.log(
    `App monitoring initialized. Inactivity timeout set to ${timeout}ms.`
  );
};

const stopHeartbeat = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("App monitoring stopped.");
  }
};

initializeHeartbeat(15000, () => {});

module.exports = {
  updateHeartbeat,
  stopHeartbeat,
};
