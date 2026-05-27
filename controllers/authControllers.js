const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getSignup = (req, res) => {
  res.render("auth/signup.ejs", {
    pageTitle: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      name: "",
      email: "",
      userType: "",
    },
    user: {},
  });
};
exports.postSignup = [
  check("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name should be atleast 2 character long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter valid emial id")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("password should be atleast 8 character")
    .matches(/[A-Z]/)
    .withMessage("password should contain atleast one Uppercase")
    .matches(/[a-z]/)
    .withMessage("password should contain atleast one Lowercase")
    .matches(/[0-9]/)
    .withMessage("password should contain atleast one Number")
    .matches(/[!@&]/)
    .withMessage("password should contain atleast one special characters"),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user types"),

  (req, res, next) => {
    const { name, email, password, userType } = req.body;
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup.ejs", {
        pageTitle: "Signup",
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: { name, email, password, userType },
        user: {},
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        const user = new User({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hashedPassword,
          userType: userType,
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => {
        return res.status(422).render("auth/signup.ejs", {
          pageTitle: "Signup",
          isLoggedIn: false,
          errors: [err.message],
          oldInput: { name, email, password, userType },
          user: {},
        });
      });
  },
];

exports.getLogin = (req, res) => {
  res.render("auth/login.ejs", {
    pageTitle: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login.ejs", {
      pageTitle: "login",
      isLoggedIn: false,
      errors: ["User Does Not Exist"],
      oldInput: { email },
      user: {},
    });
  }

  console.log("Entered Password:", password);
  console.log("DB Hashed Password:", user.password);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password Match:", isMatch);
  if (!isMatch) {
    return res.status(422).render("auth/login.ejs", {
      pageTitle: "login",
      isLoggedIn: false,
      errors: ["Incorrect Password"],
      oldInput: { email },
    });
  }
  // console.log(req.body);
  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save(() => {
    res.redirect("/");
  });
  // res.cookie("isLoggedIn", true);
  // req.isLoggedIn = true;
};

exports.postLogout = (req, res) => {
  // res.clearcookie("isLoggedIn");
  // res.cookie("isLoggedIn", false);
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
