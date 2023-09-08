const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const propertyRouter = require("./routes/propertiesRoute");
const requestRouter = require("./routes/request");
const oauthRouter = require("./routes/oauth");
const userRouter = require("./routes/usersRoute");
const reviewRouter = require("./routes/reviewRoutes");
const agentRouter = require("./routes/agentRoutes");
const globalErrorHandler = require("./controllers/errController");
const AppError = require("./utils/appError");
const path = require("path");

const app = express();

//Cross-Origin Resource Sharing to pass the frontend
app.use(cors());

//Using helmet package(set special security headers) against Xss attacks
app.use(helmet());

//See Request Data in console
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Implementing rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests, try again!",
});

//Mount the rate limit
app.use("/api", limiter);

//Use Body Parser and limit body payload
app.use(express.json({ limit: "10kb" }));

//USing mongo-sanitize (preventing nosql query injection attacks)
app.use(mongoSanitize());

//Using xss clean (preventing malicious html code injection)
app.use(xss());

//Preventing Parameter pollution
app.use(hpp({ whitelist: ["toilets", "bedrooms", "baths", "price"] }));

//Mount the Router
app.use("/api/v1/oauth", oauthRouter);
app.use("/api/v1/request", requestRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/agents", agentRouter);

//Error Handling:Incorrect Routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot get ${req.originalUrl} on this server`, 404));
});

//Global error Handler/Middleware
app.use(globalErrorHandler);

module.exports = app;
