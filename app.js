const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const cocktailRouter = require("./routes/cocktailRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.enable("trust proxy");

// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.CORS_ORIGIN],
//   })
// );

// app.options(
//   "https://cocktails-node-js.herokuapp.com",
//   cors({
//     methods: "PUT, POST, PATCH, DELETE, GET",
//     allowedHeaders:
//       "*, Origin, X-Requested-With, Content-Type, Accept, Authorization",
//   })
// );

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
  res.header(
    "Access-Control-Allow-Headers",
    "*, Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET, OPTIONS"
    );
    return res.status(200).json({});
  }
  next();
});

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use("/api/v1/cocktails", cocktailRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
