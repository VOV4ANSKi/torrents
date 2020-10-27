const router = require("express").Router(),
  torrentsController = require("../controllers/torrentsController"),
  { body } = require("express-validator");

router.get("/", torrentsController.index );

router.get("/new", torrentsController.new);
router.post("/create", [

  body("name").matches(/^[A-Za-z0-9 ]+$/).withMessage("you can use only alphabets and numbers in the name")
    .isLength({min: 5, max: 30})
    .withMessage("name of the torrent is too small or big"),
    
  body("description").matches(/^[A-Za-z0-9!,.?()%-=+ ]+$/)
    .withMessage("you can use only english alphabets and numbers with punctuation marks in description")
    .isLength({min: 10, max: 333})
    .withMessage("description of the torrent is too small or big"),

  ], torrentsController.validate, torrentsController.create, torrentsController.redirectView);
  
router.get("/:id/download", torrentsController.download);
  
router.get("/:id", torrentsController.show);

router.get("/:id/edit", torrentsController.edit);
router.put("/:id/update", [

  body("name").matches(/^[A-Za-z0-9 ]+$/)
    .withMessage("you can use only english alphabets and numbers in the name")
    .isLength({min: 5, max: 30})
    .withMessage("name of the torrent is too small or big"),
    
  body("description").matches(/^[A-Za-z0-9!,.?()%-=+ ]+$/)
    .withMessage("you can use only alphabets and numbers in description")
    .isLength({min: 10, max: 333})
    .withMessage("description of the torrent is too small or big"),

  ], torrentsController.validate, torrentsController.update, torrentsController.redirectView);
  
router.delete("/:id/delete", torrentsController.delete,
  torrentsController.redirectView);

module.exports = router;
