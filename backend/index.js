const express = require("express");
const cors = require("cors");
const dmxRoutes = require("./routes/dmxRouter");
// const gptRoutes = require("./routes/gptRoutes");
require("dotenv").config();

const port = 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use("/", dmxRoutes);
// app.use("/gpt", gptRoutes);

// Start the app
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
