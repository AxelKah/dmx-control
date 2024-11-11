require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dmxRoutes = require("./routes/dmxRouter");
const gptRoutes = require("./routes/gptRouter");

const port = 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use("/", dmxRoutes);
app.use("/gpt", gptRoutes);

const mongoString = process.env.DB_URL;
if (mongoString) {
  mongoose.connect(mongoString);
  mongoose.set("sanitizeFilter", true);

  const database = mongoose.connection;
  database.once("connected", () => {
    console.log("Database Connected");
  });

  database.on("error", (error) => {
    console.log(error);
  });
}

// Start the app
app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
