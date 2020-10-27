const httpStatus = require("http-status-codes");

module.exports = {

  pageNotFoundError: (req, res) => {
    res.status(httpStatus.NOT_FOUND);
    res.sendFile("./public/html/404.html", {root: "./"});
  },
  
  internalServerError: (error, req, res, next) => {
    console.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR);
    res.sendFile("./public/html/500.html", {root: "./"});
  }
  
};
