const router = require("express").Router();

router.get("/", (req, res) => res.render("homePage"));

module.exports = router;
