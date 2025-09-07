import express from "express";
import path, { dirname } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError from "http-errors";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import cors from "cors";
import router from "./routes/index.js";
import responses from "./responses/index.js";
import { checkRabbitMQConnection } from "./queue/index.js";
import { receiveMessages } from "./queue.process.js";

// import("./queue/index.js");
var app = express();
app.use(logger("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://10.149.6.86:5173"], // ✅ NOT "*"
    credentials: true, // ✅ Required to allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/public", express.static(path.join(__dirname, "../public")));

app.use("/api", router);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const errorMessage = typeof err === "string" ? err : err.message;
  res
    .status(500)
    .send(responses.internalServer("Something Went worng", errorMessage));
});

checkRabbitMQConnection()

export default app;

