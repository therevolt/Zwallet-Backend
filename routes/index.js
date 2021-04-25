const express = require("express");
const Route = express.Router();
const user = require("./user");
const trx = require("./transaction");
const wallet = require("./wallet");
const otp = require("./otp");

Route.use("/users", user);
Route.use("/trx", trx);
Route.use("/wallet", wallet);
Route.use("/otp", otp);

module.exports = Route;
