const mongoose = require("mongoose"),
  { Schema } = mongoose;
  
const commentSchema = new Schema({

  text: {
    type: String,
    minlength: 2,
    maxlength: 500,
    required: true
  },
  
  creator: {type: Schema.Types.ObjectId, ref: "User"}

}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);
