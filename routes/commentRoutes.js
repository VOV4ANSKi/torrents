const router = require("express").Router(),
  commentsController = require("../controllers/commentsController"),
  { body } = require("express-validator");
  
router.post("/create", [

  body("text").isLength({min: 2, max: 400})
    .withMessage("Your comment is too small or too big")
    .escape()
    
], commentsController.validate, commentsController.create);
  
module.exports = router;


