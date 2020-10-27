const router = require("express").Router(),
  torrentsController = require("../controllers/torrentsController");

router.post("/search", torrentsController.search);

module.exports = router;
