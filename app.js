const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const session = require("express-session");
// const MongoStore = require("connect-mongo")(session);
// const passport = require("./passport-config");
const bcrypt = require("bcryptjs");
// const LocalStrategy = require("passport-local").Strategy;

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const blogRouter = require("./routes/blogPosts");
const adminRouter = require("./routes/admin");

require("dotenv").config();

const app = express();

const dev_db_url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pkunk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose
  .connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: new MongoStore({ mongooseConnection: mongoose.connection }),
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/blogPosts", blogRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
