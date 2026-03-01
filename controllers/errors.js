exports.pageNotFound = (req, res) => {
  res.status(404).render("404.ejs", {
    pageTitle: "page not found",
    currentPage: "404",
    isLoggedIn: req.isLoggedIn,
    user: {},
  });
};
