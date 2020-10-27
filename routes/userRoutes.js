const router = require("express").Router(),
  { body } = require("express-validator"),
  usersController = require("../controllers/usersController");
  
router.get("/", usersController.index);

router.get("/new", usersController.new);
router.post("/create", [

  body("username").trim().isAlphanumeric()
    .withMessage("username consists of forbidden characters")
    .isLength({min: 5, max: 11}).withMessage("username's length can range from 5 to 11 symbols")
    .customSanitizer(username => "@" + username),
    
  body("password").not().matches(/ /)
    .withMessage("you can't use whitespaces in your password")
    .isLength({min: 6, max: 25}).withMessage("password is too small or too big!")
  
], usersController.validate, usersController.create, usersController.redirectView);

router.get("/login", usersController.login);
router.post("/login",

  body("username")
    .trim().ltrim("@").customSanitizer(username => "@" + username),
    
  usersController.validate, usersController.authenticate);

router.get("/logout", usersController.logout);

router.get("/:id", usersController.show);

router.put("/:id/updatePassword", [
  
  body("newPassword").not().matches(/ /)
    .withMessage("you can't use whitespaces in your new password")
    .isLength({min: 6, max: 25}).withMessage("new password is too small or too big!")

], usersController.validate, usersController.updatePassword);
    
router.put("/:id/update",

  body("username").trim().isAlphanumeric()
    .withMessage("Your username consists of forbidden characters")
    .isLength({min: 5, max: 11}).withMessage("username is too small!")
    .customSanitizer(username => "@" + username),
    
    usersController.validate,
    usersController.update, 
    usersController.redirectView
   
);

router.delete("/:id/delete", usersController.delete,
  usersController.redirectView);
  
module.exports = router;
