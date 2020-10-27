const User = require("../models/user"),
  passport = require("passport"),
  jwt = require("jsonwebtoken"),
  { validationResult } = require("express-validator"),
  httpStatus = require("http-status-codes"),
  errorController = require("./errorController"),
  isValidObjectId = require("mongoose").Types.ObjectId.isValid,
  randomColor = require("randomcolor");
  
module.exports = {

  login: (req, res) => {
  
    res.render("users/login");
  
  },
  
  validate: (req, res, next) => {
  
    let errors = validationResult(req);
    
    if (!errors.isEmpty()) {
    
      errors = errors.array().map(e => e.msg);
      
      req.flash("error", errors.join(" and "));
      
      res.redirect("/users");
    
    } else {
    
      next();
    
    }
  
  },
  
  authenticate: passport.authenticate("local", {
  
    failureRedirect: "/users/login",
    failureFlash: "No such username or incorrect password",
    
    successRedirect: "/",
    successFlash: "The login process was succesfull"
  
  }),
  
  logout: (req, res) => {
  
    req.logout();
    req.flash("success", "You've been succesfully logout");
    res.redirect("/");
  
  },
  
  index: (req, res, next) => {
  
    User.find()
    
      .then(users => {
      
        res.render("users/index", {users});
      
      })
      
      .catch(error => {
      
        console.error(`Error fetching users: ${error.message}`);
        next(error);
      
      })
  
  },
  
  new: (req, res) => {
  
    res.render("users/new");
  
  },
  
  create: (req, res, next) => {
  
    User.register({username: req.body.username, color: randomColor()}, req.body.password, (error, user) => {
    
      if (!error) {
      
        req.flash("success", `${user.username}'s account is created succesfully!`);
        res.locals.redirect = "/";
        return next();
      
      } else {
      
        req.flash("error", `Failed to create your account: ${error.message}!`);
        res.locals.redirect = "/users/new";
        res.redirect("/users/new");
      
      }
      
    });
  
  },
  
  show: (req, res, next) => {
    
    if (!isValidObjectId(req.params.id)) {
    
      errorController.pageNotFoundError(req, res)
    
    } else {
    
      User.findById(req.params.id)
        
        .then(user => {
        
          if (user) return User.populate(user, "ownTorrents");
          
          else errorController.pageNotFoundError(req, res);;
          
        })
        
        .then(populatedUser => {
        
          if (!req.isAuthenticated() || req.user._id != req.params.id) res.render("users/unloggedShow", {populatedUser});
        
          else res.render("users/show", {populatedUser});

        })
        
        .catch(error => {
        
          console.error(`Error fetching user by ID: ${error.message}`);
          next(error);
        
        })
    
    }
    
  },
  
  update: (req, res, next) => {
  
    if (req.isAuthenticated() && req.user._id == req.params.id) {
    
      User.findByIdAndUpdate(req.params.id, {$set: {username: req.body.username}})
      
        .then(user => {
        
          req.flash("success", "updated succesfully!")
          res.locals.redirect = `/users/${req.user._id}`;
          res.locals.user = user;
          return next();
        
        })
        
        .catch(error => {
        
          req.flash("error", `updation is failed, such username already exists!`);
          console.error(`Error updating user by ID: ${error.message}`);
          res.redirect(`/users/${req.user._id}`);
        
        })
    
    } else {
    
      res.status(httpStatus.FORBIDDEN)
        .json({error: true, message: "you are trying to change profile of someone else"});
    
    }
  
  },
  
  updatePassword: (req, res) => {
  
    if (req.isAuthenticated() && req.user._id == req.params.id) {
    
    User.findById(req.user._id)
    
      .then(user => {
      
        user.changePassword(req.body.oldPassword, req.body.newPassword)
        
          .then(() => {
          
            req.flash("success", "password is changed!");
            res.redirect(`/users/${req.user._id}`);
          
          })
          
          .catch(error => {
          
            req.flash("error", error.message);
            res.redirect(`/users/${req.user._id}/editPassword`);
          
          })
      
      })
      
      .catch(error => {
      
        req.flash("error", error.message);
        res.redirect("/users");
      
      })
    

    
    } else {
    
      res.status(httpStatus.FORBIDDEN)
        .json({error: true, message: "you are trying to change profile of someone else"});
    
    }
  
  },
  
  delete: (req, res, next) => {
  
    if (req.isAuthenticated() && req.user._id == req.params.id) {
    
      User.findByIdAndRemove(req.params.id)
      
        .then(user => {
        
          req.flash("success", "deleted succesfully!")
          res.locals.redirect = "/users";
          return next();
        
        })
        
        .catch(error => {
        
          req.flash("error", `deletion is failed: ${error.message}`);
          console.error(`Error deletion user by ID: ${error.message}`);
          next(error);
        
        })
    
    } else {
    
      res.status(httpStatus.FORBIDDEN)
        .json({error: true, message: "you are trying to delete profile of someone else!"});
    
    }
  
  },
  
  redirectView: (req, res) => {
  
    res.redirect(res.locals.redirect);
  
  }
  
};













