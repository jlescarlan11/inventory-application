const express = require("express");
const app = express();
const path = require("node:path");
const assetsPath = path.join(__dirname, "views");
const inventoriesRouter = require("./routes/inventoriesRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.use("/", inventoriesRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My Express App - listening on ${PORT}`);
});
