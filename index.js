const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("rate-limiter-flexible");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const app = express();
require("dotenv").config();
require("./src/api/v1/config/db");
const userRouter = require("./src/api/v1/router/user");
const blogRouter = require("./src/api/v1/router/blog");
app.use(morgan("combined"));
const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
// implementing rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.get("/", (req, res) => {
  console.log("Working fine");
  res.status(200).json({ success: true, message: "Working fine" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`connection succesful  at port ${port}`);
});
