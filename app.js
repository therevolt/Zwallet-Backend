const express = require("express");
const cors = require("cors");

//Models
const db = require("./models");

//Routes Index
const Routes = require("./routes");
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/avatar", express.static("./upload"));

// Sync Database
db.sequelize.sync().then(
  () => console.log(`[DATABASES] Connected`),
  (err) => console.log(`[DATABASES] Failed To Connect (${err})`)
);

app.use("/v1", Routes);

app.use("*", (req, res) => {
  if (req.params["0"].match("/v1")) {
    res.status(405).json({
      status: false,
      message: "Method Not Allowed",
      data: null,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to REST API",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Success running on port ${PORT}`);
});
