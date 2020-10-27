const Torrent = require("../models/torrent"),
  Comment = require("../models/comment"),
  { validationResult } = require("express-validator");

module.exports = {

  create: (req, res) => {
  
    let commentFields = {
    
      text: req.body.text,
      creator: req.user._id
    
    };
    
    console.log(commentFields);
  
    Comment.create(commentFields)
    
      .then(comment => {
      
        console.log(comment);
      
        return Torrent.findByIdAndUpdate(req.query.torrent, {$push: {comments: comment}});
      
      })
      
      .then(() => {
      
        req.flash("success", "Comment was succesfully uploaded!");
        res.redirect(`/torrents/${req.query.torrent}`);
      
      })
      
      .catch(error => {
      
        console.error(`Error occured while uploading the comment: ${error.message}`);
        req.flash("error", `Sorry, something's gome wrong: ${error.message}`);
        res.redirect(`/torrents`);
      
      })
  
  },
  
  validate: (req, res, next) => {
  
    let errors = validationResult(req);
    
    if (!errors.isEmpty()) {
    
      errors = errors.array().map(e => e.msg);
      
      req.flash("error", errors.join(" and "));
      
      res.redirect("/torrents");
    
    } else {
    
      next();
    
    }
  
  },

}
