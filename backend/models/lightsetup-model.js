const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Lights = sequelize.define(
  "Lights",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lights: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "SAVED_LIGHTSETUPS",
  }
);

Lights.sync()
  .then(() => console.log("Lights table synced"))
  .catch((err) => console.log("Error syncing Lights table: ", err));

module.exports = Lights;
