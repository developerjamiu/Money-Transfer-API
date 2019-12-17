const _ = require("lodash");
const auth = require("../middleware/auth");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

//Funding user wallet
router.put("/fund", auth, async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);

  user.balance = await (user.balance + req.body.amount);

  await user.save();
  res.send({
    message: "Wallet funded",
    balance: user.balance
  });
});

//Transferring to another user
router.get("/recipient", auth, async (req, res) => {
  let recipient = await User.findOne({ emailAddress: req.query.emailAddress });
  if (!recipient) return res.status(400).send("User not found");

  res.send({
    fullName: recipient.fullName,
    emailAddress: recipient.emailAddress,
    balance: recipient.balance,
    _id: recipient._id
  });
});

//Transferring to another user
router.put("/tmtransfer", auth, async (req, res) => {
  const { error } = validateUserForTransfer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);

  let recipient = await User.findOne({ emailAddress: req.body.emailAddress });
  if (!recipient) return res.status(400).send("User not found");

  const amount = Number(req.body.amount);

  if (!(user.balance >= amount))
    return res.status(400).send("Insufficient funds");

  user.balance = await (user.balance - amount);
  recipient.balance = await (recipient.balance + amount);

  await user.save();
  await recipient.save();

  res.send({
    message: "Transfer succesful",
    balance: user.balance,
    fullName: user.fullName
  });
});

//Transferring to another transfer money user
router.put("/transfer", auth, async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);

  if (!(user.balance >= req.body.amount))
    return res.status(400).send("Insufficient funds");

  user.balance = await (user.balance - req.body.amount);

  await user.save();
  res.send({
    message: "Transfer successful",
    balance: user.balance
  });
});

function validateUser(req) {
  const schema = {
    amount: Joi.number()
      .max(150000)
      .required()
  };

  return Joi.validate(req, schema);
}

function validateUserForTransfer(req) {
  const schema = {
    emailAddress: Joi.string()
      .email()
      .min(5)
      .max(255)
      .required(),
    amount: Joi.number()
      .max(150000)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
