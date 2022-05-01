const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  name: { type: String, required: true },
  commentPost: { type: String, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
