const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("index", { title: "Express" });
  res.json({ msg: "wrong place bucko" });
});

module.exports = router;
