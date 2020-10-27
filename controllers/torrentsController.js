const User = require("../models/user"),
  Torrent = require("../models/torrent"),
  httpStatus = require("http-status-codes"),
  errorController = require("./errorController"),
  isValidObjectId = require("mongoose").Types.ObjectId.isValid,
  { validationResult } = require("express-validator"),
  randomColor = require("randomcolor");

module.exports = {

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

  index: (req, res, next) => {
  
    Torrent.find()
    
      .then(torrents => {
        
        return res.render("torrents/index", {torrents});
                
      })
      
      .catch(error => {
      
        console.error(`Error fetching torrents: ${error.message}`);
        next(error);
        
      });
      
    },
    
    search: (req, res, next) => {
    
      Torrent.find({$text: {$search: req.body.text.trim()}})
      
        .then(torrents => {
        
          if (!torrents.length) {
          
            req.flash("error", "Nothing we could find :(");
            return res.redirect("/");
          
          } else {
          
            res.render("torrents/index", {torrents});
          
          }
        
        })
        
        .catch(error => {
        
          next(error);
        
        })
    
    },
    
    new: (req, res) => {
    
      res.render("torrents/new");
      
    },
    
    create: (req, res, next) => {
    
      if (req.isAuthenticated()) {
      
        if (!req.files.torrent || req.files.torrent.mimetype !== "application/x-bittorrent" || req.files.torrent.truncated) {
        
          req.flash("error", "your file must be a torrent file with size less then 2GB!");
          res.redirect("/torrents");
        
        } else {
          
            let torrentParams = {
          
              name: req.body.name,
              description: req.body.description,
              color: randomColor(),
              owner: req.user._id,
            
            };
          
            Torrent.create(torrentParams)
            
              .then(torrent => {
              
                req.files.torrent.mv(`./public/torrents/${torrent._id}.torrent`, error => {
                
                  if (error) {
                  
                    Torrent.findByIdAndRemove(torrent._id)
                    
                      .then(() => {
                       
                        req.flash("error", `sorry, we can't upload your file: ${error.message}`);
                        res.locals.redirect = "/torrents";
                        return next()
                      
                      })
                      
                      .catch(error => {
                      
                        return next(error)
                      
                      })
                  
                  } else {
                  
                    User.findById(req.user._id)
                    
                      .then(user => {
                      
                        user.ownTorrents.push(torrent._id);
                        
                        return user.save()
                        
                      })
                      
                      .then(() => {
                      
                        req.flash("success", "uploaded succesfully!");
                        res.redirect(`/users/${req.user._id}`);
                      
                      })
                      
                      .catch(error => {
                      
                        return next(error)
                      
                      })
                  
                  }
                
                });
                
              })
              
              .catch(error => {
              
                console.error(`Error saving torrent: ${error.message}`);
                next(error);
                
              });
            
        }
        
      } else {
        
          res.status(httpStatus.FORBIDDEN)
            .json({error: true, message: "you are trying to upload a torrent without a authenticated account!"});
        
      }  
       
    },
    
    download: (req, res) => {
    
      res.download(
        
        `./public/torrents/${req.params.id}.torrent`,
        
        `${req.params.id}.torrent`,
      
         error => {
         
          if (error) {
          
            console.error(error.message);
            req.flash("error", `sorry, we can't upload the file: ${error.message}`);
            return res.redirect("/torrents");
          
          } else {
          
            if (!req.isAuthenticated()) {
            
              return;

            } else {
            
              User.findById(req.user._id)
              
                .then(user => {
                
                  if (!user.ownTorrents.includes(req.params.id) && !user.downloadedTorrents.includes(req.params.id)) {
                  
                    return User.findByIdAndUpdate(req.user._id, {$addToSet: {downloadedTorrents: req.params.id}, $inc: {karma: 1}})
                  
                  } else {
                  
                    throw Error("It's okay, just stopping the Promise :)");
                  
                  }
                
                })
                
                .then(user => {
                  
                  return Torrent.findByIdAndUpdate(req.params.id, {$inc: {nounOfDownloads: 1, karma: user.karma}});
                
                })
              
                .then(torrent => {
                
                
                  return User.findByIdAndUpdate(torrent.owner, {$inc: {karma: 1}});
                
                })
                
                .then(user => {
                
                  console.log(`User (${user._id}) was updated succesfully!`);
                
                })
                
                .catch(error => {
                
                  console.error(error.message);
                
                })
            
            }
            
          }
          
        });
    
    },
    
    show: (req, res) => {
    
    if (!isValidObjectId(req.params.id)) {
    
      errorController.pageNotFoundError(req, res)
    
    } else {
    
      Torrent.findById(req.params.id)
      
        .populate({path: "owner"})
        .populate({path: "comments", populate: {path: "creator"}})
        
          .then(torrent => {
          
            if (torrent) {
            
             torrent.comments.reverse();            
             res.render("torrents/show", {torrent});
            
            } else {
            
              errorController.pageNotFoundError(req, res);
            
            }
            
          })
        
          .catch(error => {
          
            console.error(`Error fetching torrents by ID: ${error.message}`);
            next(error);
            
          });
        
    }
    
    },
    
    edit: (req, res, next) => {
    
      if (req.isAuthenticated() && req.user.ownTorrents.includes(req.params.id)) {
      
        Torrent.findById(req.params.id)
        
          .then(torrent => {
          
            res.render("torrents/edit", {torrent});
            
          })
          
          .catch(error => {
          
            console.error(`Error fetching torrents by ID: ${error.message}`);
            next(error);
            
          });
        
        } else {
        
          res.status(httpStatus.FORBIDDEN)
            .json({error: true, message: "you are trying to edit a torrent of someone else!"});
        
        }
    
    },
    
    update: (req, res, next) => {
    
      if (req.isAuthenticated() && req.user.ownTorrents.includes(req.params.id)) {
      
        let torrentParams = {
        
          name: req.body.name,
          description: req.body.description,
        
        };
        
        Torrent.findByIdAndUpdate(req.params.id, {$set: torrentParams})
        
          .then(torrent => {
          
            res.locals.redirect = `/torrents/${req.params.id}`;
            res.locals.torrent = torrent;
            next();
            
          })
          
          .catch(error => {
          
            console.error(`Error updating torrent by ID: ${error.message}`);
            next(error);
            
          });
      
      } else {
      
                
          res.status(httpStatus.FORBIDDEN)
            .json({error: true, message: "you are trying to update a torrent of someone else!"});
      
      }
        
    },
    
    delete: (req, res, next) => {
    
      if (req.isAuthenticated() && req.user.ownTorrents.includes(req.params.id)) {
      
        Torrent.findByIdAndRemove(req.params.id)
        
          .then(() => {
          
            res.locals.redirect = "/torrents";
            next();
            
          })
          
          .catch(error => {
          
            console.error(`Error deleting torrent by ID: ${error.message}`);
            next(error);
            
          });
          
        } else {
        
          res.status(httpStatus.FORBIDDEN)
            .json({error: true, message: "you are trying to delete a torrent of someone else!"});
        
        }
        
    },
    
    redirectView: (req, res) => {
    
      res.redirect(res.locals.redirect);
      
    }

};





























