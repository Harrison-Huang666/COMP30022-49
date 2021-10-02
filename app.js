// obtain required APIs
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
var cookieParser = require("cookie-parser");
const cors = require("cors");

// construct app
const app = express();
const jwt = require("jsonwebtoken");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
require("./models/database");
require("./config/passport")(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// express-formidable
// app.use(formidable());

app.use(
  session({
    secret: process.env.PASSPORT_KEY,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pcrm4399.herokuapp.com",
      "https://www.4399crm.com",
    ],
    method: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(cookieParser());
//middleware that's required for passport to operate
app.use(passport.initialize());
// middleware to store user object
app.use(passport.session());

app.use(express.static("public"));

// start app
app.get("/", (req, res) => {
  console.log("Hey, there is an access request !!! ");
  res.send(
    '<p>The server is currently listening on port 4399</p>\
				<iframe src="https://giphy.com/embed/fWj2TR9mfYJ56" width="480"\
				height="264" frameBorder="0" class="giphy-embed" allowFullScreen>\
				</iframe><p hidden><a href="https://giphy.com/gifs/supernatural-yes\
				-dean-winchester-fWj2TR9mfYJ56">via GIPHY</a></p><p><a href="/api/contactController" style="font-weight:bold; text-decoration: none">API Documentation</a></p><footer>Group 049 Team 4399</footer>',
  );
});

// TODO: remove testing module
//const contactRouter = require('./routes/contactRouter.js')
//app.use('/contact', contactRouter)

// router for testing
const profileRouter = require("./routes/profileRouter");
const contactRouter = require("./routes/contactRouter");
const recordRouter = require("./routes/recordRouter");
const userRouter = require("./routes/userRouter");
const apiRouter = require("./routes/apiRouter");
const testRouter = require("./routes/testRouter");

app.use("/profile", profileRouter);
app.use("/contact", contactRouter);
app.use("/record", recordRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);
app.use("/test", testRouter);

// handling invalid links
app.all("*", (req, res) => {
  // 'default' route to catch user errors
  res.status(404).send();
});

if (!module.parent) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(
      `the team 4399's server is listening at PORT: ${process.env.PORT}`,
    );
  });
}

module.exports = app;
