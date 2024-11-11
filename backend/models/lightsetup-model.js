const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const lightsarraySchema = new Schema({
  channel: Number,
  color: String,
  containerId: String,
  id: Number,
  intensity: Number,
  selected: Boolean,
  startAddress: Number,
});

const lightsSchema = new Schema(
  {
    name: { type: String, required: true },
    lights: { type: [lightsarraySchema], required: true },
  },
  { timestamps: true, collection: "SAVED_LIGHTSETUPS" }
);

const Lights = model("Lights", lightsSchema);

module.exports = Lights;