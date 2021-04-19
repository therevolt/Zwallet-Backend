const express = require("express");
const Route = express.Router();
const user = require("./user");
const trx = require("./transaction");
const wallet = require("./wallet");

Route.use("/users", user);
Route.use("/trx", trx);
Route.use("/wallet", wallet);

module.exports = Route;
