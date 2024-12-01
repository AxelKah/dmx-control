require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dmxRoutes = require("./routes/dmxRouter");
const gptRoutes = require("./routes/gptRouter");
const { updateHeartbeat, stopHeartbeat } = require("./utils/heartbeat");
const { performCleanup } = require("./utils/cleanup");

const port = 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use("/", dmxRoutes);
app.use("/gpt", gptRoutes);

// to check if app is still running
// if not, then closes the lights
app.post("/heartbeat", (req, res) => {
  updateHeartbeat();
  res.status(200).send({ message: "Heartbeat received." });
});

const handleShutdown = async (signalOrError) => {
  const isError = signalOrError instanceof Error;
  const reason = isError
    ? `Uncaught exception: ${signalOrError.message}`
    : `Signal received: ${signalOrError}`;
  console.log(`${reason}. Performing shutdown...`);

  try {
    await performCleanup();
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError.message);
  }

  stopHeartbeat();

  const exitCode = isError ? 1 : 0;
  process.exit(exitCode);
};

process.on("SIGINT", handleShutdown); // ctrl+c
process.on("SIGTERM", handleShutdown); // termination
process.on("uncaughtException", (err) => {
  handleShutdown(err);
});

// Start the app
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});

app.on("close", async () => {
  console.log("App is closing. Running cleanup.");
  await performCleanup();
});
