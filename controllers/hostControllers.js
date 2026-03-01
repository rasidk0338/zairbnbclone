const Home = require("../models/home");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.getAddHome = (req, res) => {
  res.render("host/edit-home.ejs", {
    pageTitle: "Add home to airbnb",
    editing: false,
    home: null,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getHostHomes = (req, res) => {
  Home.find().then((registerHomes) => {
    res.render("host/host-home-list.ejs", {
      registerHomes: registerHomes,
      pageTitle: "Host-Homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddHome = async (req, res) => {
  const { houseName, price, location, rating, descriptions } = req.body;

  // console.log(houseName, price, location, rating, descriptions);
  // console.log(req.file);

  if (!req.file) {
    return res.status(422).send("No image provided");
  }

  // Upload local file to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "airbnb-homes",
  });

  // remove temp file
  fs.unlink(req.file.path, (err) => {
    if (err) console.log("Failed to remove temp file:", err);
  });

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo: result.secure_url,
    cloudinary_id: result.public_id,
    descriptions,
  });
  await home
    .save()
    .then((result) => {
      console.log("HOME SAVED Successfully!");
      res.redirect("/host-home-list");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).render("404.ejs", { pageTitle: "Error" });
    });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.id;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host-add-home");
    }

    // console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postEditHome = async (req, res) => {
  const { _id, houseName, price, location, rating, descriptions } = req.body;
  console.log("BODY DATA:", req.body);

  try {
    const home = await Home.findById(_id);

    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.descriptions = descriptions;
    home.rating = rating;

    console.log("FILE DATA:", req.file);

    if (req.file) {
      // Delete old image from Cloudinary using stored public_id
      if (home.cloudinary_id) {
        await cloudinary.uploader.destroy(home.cloudinary_id);
        console.log("Old image deleted");
      }

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "airbnb-homes",
      });

      // remove temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("Failed to remove temp file:", err);
      });

      home.photo = uploadResult.secure_url;
      home.cloudinary_id = uploadResult.public_id;
    }

    await home.save();
    console.log("Home Updated Successfully");

    res.redirect("/host-home-list");
  } catch (err) {
    console.log(err);
    res.status(500).render("404.ejs", { pageTitle: "Error" });
  }
};

exports.deleteHome = async (req, res) => {
  const homeId = req.params.id;

  try {
    const home = await Home.findById(homeId);

    if (home && home.cloudinary_id) {
      await cloudinary.uploader.destroy(home.cloudinary_id);
      console.log("Image deleted from Cloudinary");
    }

    await Home.findByIdAndDelete(homeId);

    res.redirect("/host-home-list");
  } catch (err) {
    console.log(err);
    res.status(500).render("404.ejs", { pageTitle: "Error" });
  }
};
