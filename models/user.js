const mongoose = require("mongoose"),
  { Schema } = mongoose,
  passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({

  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },
  
  karma: {
    type: Number,
    default: 0
  },
  
  color: {
  
    type: String,
    required: true
  
  },
  
  ownTorrents: [{type: Schema.Types.ObjectId, ref: "Torrent"}],
  
  downloadedTorrents: [{type: Schema.Types.ObjectId, ref: "Torrent"}],

}, {timestamps: true});

userSchema.plugin(passportLocalMongoose, {usernameField: "username"});

userSchema.virtual("info").get(function() {

  let info = {
  
    nounOfOwnTorrents: this.ownTorrents.length,
    nounOfDownloadedTorrents: this.ownTorrents.length
    
  }
  
  return info;
  
});

module.exports = mongoose.model("User", userSchema);

