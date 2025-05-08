const startServer = async (sequelize, port) => {
  try {
    // Database Connection and Migration
    console.log("Connecting to database....");

    sequelize
      .authenticate()
      .then(() => {
        console.log("Database connected successfully");
      })
      .catch((err) => {
        console.log("Error: " + err);
      });

    // await sequelize.sync({ alter: true });

    console.log("✅ Server started on port:" + port);
  } catch (error) {
    // Handle errors gracefully during startup
    console.error("❌ Error starting the server:", error);

    // Exit Process (optional, but often useful for critical startup errors)
    process.exit(1);
  }
};

module.exports = { startServer };
