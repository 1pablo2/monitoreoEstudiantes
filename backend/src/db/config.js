import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "monitoreoestudiantesbd",
  "root",
  "1234",
  {
    host: "localhost",
    port: "3306",
    dialect: "mysql",
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync(); // No uses force: true en producción, solo para desarrollo
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { syncDatabase, sequelize };
