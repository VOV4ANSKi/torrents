const router = require("express").Router(),
  errorRoutes = require("./errorRoutes"),
  userRoutes = require("./userRoutes"),
  torrentRoutes = require("./torrentRoutes"),
  homeRoutes = require("./homeRoutes"),
  apiRoutes = require("./apiRoutes"),
  commentRoutes = require("./commentRoutes");
  
router.use("/users", userRoutes);
router.use("/torrents", torrentRoutes);
router.use("/comments", commentRoutes);
router.use("/api", apiRoutes);
router.use("/", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;
