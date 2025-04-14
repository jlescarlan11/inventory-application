const express = require("express");
const app = express();
const path = require("node:path");
const assetsPath = path.join(__dirname, "public");
const inventoriesRouter = require("./routes/inventoriesRouter");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", inventoriesRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My Express App - listening on ${PORT}`);
});
