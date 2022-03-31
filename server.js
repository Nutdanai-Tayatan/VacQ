const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

//add cookie parser
app.use(cookieParser());
app.use(hpp());
app.use(mongoSanitize());
app.use(helmet());
app.use(cors());

app.use(xss());

const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10mins
  max: 100,
});
app.use(limiter);

const hospitals = require("./routes/hospitals.js");
const register = require("./routes/auth");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");
app.use(express.json());

app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", register);
app.use("/api/v1/appointments", appointments);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`);
});

process.on("unhandledRejection", (err, Promise) => {
  console.log(`Error : ${err.message}`);
  server.close(() => process.exit(1));
});
