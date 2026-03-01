const User = require("../models/user");
const Home = require("../models/home");

exports.getIndex = (req, res) => {
  console.log("Session Value", req.session);
  Home.find().then((registerHomes) => {
    res.render("store/index.ejs", {
      registerHomes: registerHomes,
      pageTitle: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res) => {
  Home.find().then((registerHomes) => {
    res.render("store/home-list.ejs", {
      registerHomes: registerHomes,
      pageTitle: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res) => {
  res.render("store/booking.ejs", {
    pageTitle: "My bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getfavourite = async (req, res) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favorite-list.ejs", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(id)) {
    user.favourites = user.favourites.filter((fav) => fav != id);
    await user.save();
  }
  res.redirect("/favourites");

  // Favourite.findOneAndDelete({ houseId: id })
  //   .then((result) => {
  //     console.log("Fav Remove: ", result);
  //   })
  //   .catch((err) => {
  //     console.log("Error while removing from favourite: ", err);
  //   })
  //   .finally(() => {
  //     res.redirect("/favourites");
  //   });
};

exports.getHomeDetail = (req, res) => {
  const homeId = req.params.id;
  // console.log(homeId);
  Home.findById(homeId)

    .then((home) => {
      if (!home) {
        res.status(404).render("404.ejs", {
          pageTitle: "Home Not Found",
        });
      } else {
        res.render("store/home-detail.ejs", {
          home,
          pageTitle: home.houseName,
          isLoggedIn: req.isLoggedIn,
          user: req.session.user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("404.ejs", { pageTitle: "Error" });
    });
};

// exports.getHomes = (req, res) => {
//  Home.find()
//  .then([registerHomes])=>{
//   res.render("store/index.ejs", {
//     registerHomes: registerHomes,
//     pageTitle: "airbnb home",
//   });

//  }

//   // console.log(registerHomes);
// };
