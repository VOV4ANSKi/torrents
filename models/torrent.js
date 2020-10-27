const mongoose = require("mongoose"),
  { Schema } = mongoose;
  
const torrentShema = new Schema({
  
  name: {
    type: String,
    minlength: 5,
    maxlength: 30,
    required: true,
    unique: true
  },
  
  description: {
    type: String,
    minlength: 10,
    maxlength: 333,
    required: true
  },
  
  comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
  
  color: {
  
    type: String,
    required: true
  
  },
  
  owner: {type: Schema.Types.ObjectId, ref: "User"},
  
  nounOfDownloads: {
    type: Number,
    default: 0
  },
  
  karma: {
    type: Number,
    default: 0
  },
  
}, {timestamps: true});

module.exports = mongoose.model("Torrent", torrentShema);
