navItems = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Items", href: "/items" },
];

exports.inventoriesListGet = async (req, res, next) => {
  res.render("index", { navItems });
};
