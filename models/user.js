const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");

// User Schema for storing tailors in the MongoDB database
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  emailAddress: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    minlength: 5,
    maxlength: 255,
    required: true
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: String,
    default: Date.now()
  }
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
};

const User = mongoose.model("User", userSchema);

// User validate function to validate object sent from the client
function validateUser(user) {
  const schema = {
    fullName: Joi.string()
      .min(5)
      .max(50)
      .required(),
    emailAddress: Joi.string()
      .email()
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

module.exports = {
  User: User,
  validateUser: validateUser
};
