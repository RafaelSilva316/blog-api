const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const passport = require("../passport-config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

function issueJWT(user) {
  const _id = user._id;
  const expiresIn = "1d";
  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

const registerValidate = [
  check("username")
    .isLength({ min: 8, max: 25 })
    .withMessage("username Must Be between 8 and 25 Characters")
    .trim()
    .escape(),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password Must Be at Least 8 Characters")
    .matches("[0-9]")
    .withMessage("Password Must Contain a Number")
    .matches("[A-Z]")
    .withMessage("Password Must Contain an Uppercase Letter")
    .trim()
    .escape(),
];

/* GET home page. */
router.post("/create", async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const adminsCount = await Admin.find({}).count();
    if (adminsCount !== 0) {
      res.json({ msg: "admin already exists" });
    }
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      const newAdmin = new Admin({
        username: req.body.username,
        password: hashedPassword,
      }).save((err) => {
        if (err) {
          return next(err);
        }
        res.json({
          msg: `new admin created `,
        });
      });
    });
  }
});

router.post("/login", function (req, res, next) {
  Admin.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
      return;
    }
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    //replace with bcrypt.compare()
    bcrypt.compare(req.body.password, user.password, function (err, result) {
      // result == false
      if (result) {
        const token = issueJWT(user);
        res.status(200).send({ user, accessToken: token });
      } else {
        return res.status(401).send({
          accessToken: null,
          msg: "Invalid Password",
        });
      }
    });
  });
});

module.exports = router;
