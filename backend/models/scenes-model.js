const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Scenes = sequelize.define(
  "Scenes",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lightSetupId: {
      type: DataTypes.INTEGER,
      references: {
        model: "SAVED_LIGHTSETUPS",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    colors: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "SAVED_SCENES",
  }
);

Scenes.sync()
  .then(() => console.log("Scenes table synced"))
  .catch((err) => console.log("Error syncing Scenes table: ", err));

module.exports = Scenes;
