const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
// use local disk storage for multer; controllers will upload to Cloudinary
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const DB_PATH = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

// local modules
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtils");
const errorController = require("./controllers/errors");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));
// app.set("controllers", path.join(rootDir, "controllers"));

//Creating a store collection that stored user coosies and session *start
// const store = new mongoDbStore({
//   uri: DB_PATH,
//   collection: "sessions",
// });
//End

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, randomSring(10) + "-" + file.originalname);
//   },
// });

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Use disk storage for multer; controllers will upload the temp file to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(rootDir, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const multerOption = {
  storage,
  fileFilter,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// parse multipart/form-data for single-file uploads named 'photo'
app.use(multer(multerOption).single("photo"));
app.use(express.static(path.join(rootDir, "public")));
// app.use("/uploads/", express.static(path.join(rootDir, "uploads")));
// app.use("/home/uploads/", express.static(path.join(rootDir, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: DB_PATH,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
    },
  }),
);
app.use((req, res, next) => {
  // console.log("cookie check for middleware", req.get("cookie"));
  // req.isLoggedIn = req.get("cookie")
  //   ? req.get("cookie").split("=")[1] === "true"
  //   : false;
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.use(authRouter);
app.use(storeRouter);
const isAuth = (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
// app.use((req, res, next) => {
//   if (req.isLoggedIn) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// });
app.use(isAuth, hostRouter);

app.use(errorController.pageNotFound);

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to Mongo");
    app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error While Connect with Mongo Databases", err);
  });
