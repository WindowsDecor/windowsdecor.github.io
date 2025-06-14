var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var hbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");

var fileUpload = require("express-fileupload");
var session = require("express-session");

var app = express();

// DB config
var db = require("./config/connection");

// View engine setup with custom helpers
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layouts",
    layoutDir: __dirname + "/views/layouts/",
    partialDir: __dirname + "/views/partials/",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      isExcludedPath: function (path) {
        const excluded = ["/sofasets-beanbags", "/curtains"];
        return excluded.includes(path);
      },
    },
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use(
  session({
    secret: "key",
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  })
);

// Pass currentPath to all views
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// DB connection
db.connect((err) => {
  if (err) console.log("Database error: " + err);
  else console.log("Database connected");
});

// Routes
app.use("/", usersRouter);
app.use("/admin", adminRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
