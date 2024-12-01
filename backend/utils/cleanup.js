// routes to call to close lights when app is closed
const performCleanup = async () => {
  try {
    await fetch("http://localhost:5000/clear-lights", { method: "POST" });
    await fetch("http://localhost:5000/stop-cycle", { method: "POST" });

    console.log("Cleanup done.");
  } catch (error) {
    console.error("Error performing cleanup:", error.message);
  }
};

module.exports = {
  performCleanup,
};
