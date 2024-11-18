const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("SQLite database connected");
  })
  .catch((error) => {
    console.error("Error connecting to the SQLite database: ", error);
  });

module.exports = sequelize;
