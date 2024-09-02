const express = require("express");
const app = express();
const logger = require("./utils/logger");
const router = require("./routes");
const PORT = process.env.PORT || 8090;
const pool = require("./config/dbConfig");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(logger.getHttpLoggerInstance());

app.use("/api", router);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(statusCode + ' ' + err.message)
  res.status(statusCode).send({
    success: false,
    message: err.message,
  });
});

const startServer = () => {
  pool.connect().then(() => {
    app.listen(PORT, (err) => {
      console.log(`Connected to DB & Listeing on Port ${PORT}`);
    });
  });
};

startServer();
process.on("unhandledRejection", (reason, promise) => {
  console.log(reason.name, reason.message);
  console.log("UNHANDLED REJECTION!  Shutting down...");
  throw reason;
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION!  Shutting down...");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM received");
  // if (dbClient) dbClient.close();
  if (server) server.close();
});
