const express = require("express"),
  mongoose = require("mongoose"),
  cookies = require("cookie-parser"),
  session = require("express-session"),
  flashes = require("connect-flash"),
  passport = require("passport"),
  randToken = require("rand-token"),
  rewriteMethods = require("method-override"),
  logger = require("morgan"),
  User = require("./models/user"),  
  router = require("./routes/index"),
  errorController = require("./controllers/errorController"),
  fileUpload = require("express-fileupload"),
  path = require("path");
  
const app = express();

const cookieToken = randToken.generate(16);

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/torrents", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs")

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

app.use(express.static(path.join(__dirname, "public")));

app.use(rewriteMethods("_method", {methods: ["GET", "POST"]}));

app.use(cookies(cookieToken));

app.use(session({

  secret: cookieToken,
  
  cookie: {
    maxAge: 4000000
  },
  
  saveUninitialized: false,
  resave: false

}));

app.use(flashes());

app.use(passport.initialize());

app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.flashes = req.flash();
  res.locals.isLogged = req.isAuthenticated();
  res.locals.loggedUser = req.user;
  next();
});

app.use(logger(":method :url :status * :response-time ms"));

app.use(fileUpload({

  limits: { fileSize: 2000000000 },
  useTempFiles : true

}));

app.use("/", router);

app.use(errorController.internalServerError);

const server = app.listen(app.get("port"), () => {
  console.log(`Server is running on http://localhost:${app.get("port")}/`);
})

//const io = require("socket.io")(server);

//require("./controllers/chatController")(io);



































  
