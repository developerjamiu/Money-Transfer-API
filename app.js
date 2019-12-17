const config = require("config");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const users = require("./routes/users");
const auth = require("./routes/auth");
const wallet = require("./routes/wallet");

const express = require("express");
const app = express();

if (!config.get("jwtPrivateKey")) {
  console.error("Fatal ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}
mongoose
  .connect("mongodb://localhost/transfer_money", { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB...", err));

app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/wallet", wallet);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
