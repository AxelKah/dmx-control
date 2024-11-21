const sequelize = require("../db");
const Lights = require("./lightsetup-model");
const Scenes = require("./scenes-model");

// associations
Lights.hasMany(Scenes, { foreignKey: "lightSetupId", as: "scenes" });
Scenes.belongsTo(Lights, { foreignKey: "lightSetupId", as: "lightSetup" });

module.exports = {
  sequelize,
  Lights,
  Scenes,
};
