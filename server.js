require("dotenv").config();
const express = require("express");
const app = express();
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const teacherRoute = require("./routes/teacherRoutes");
const morgan = require("morgan");

connectDB();

app.use(logger);


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan('dev'));

// Middleware function to log incoming requests
const logRequest = (req, res, next) => {
  console.log('Request body:', req.body); // Log request body if it's a POST request
  
  // Call next middleware or route handler
  next();
};

// Attach middleware globally to log all requests
app.use(logRequest);


app.use("/", express.static("public"));
``;

app.use("/", require("./routes/root"));

app.use("/auth", require("./routes/authRoutes"));
app.use("/paper", require("./routes/paperRoutes"));
app.use("/notes", require("./routes/notesRoutes"));
app.use("/internal", require("./routes/internalRoutes"));
app.use("/attandance", require("./routes/attendanceRoutes"));
app.use("/time_schedule", require("./routes/timeScheduleRoutes"));
app.use("/student",require("./routes/studentRoutes"));
app.use("/teacher",teacherRoute);



app.use(errorHandler);

mongoose.connection.once("open", () => {
  //console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

mongoose.connection.on("uncaughtException", function (err) {
  console.log(err);
});
