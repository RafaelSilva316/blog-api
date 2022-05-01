const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: { type: String, required: true },
  blogPost: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  published: { type: Boolean, default: false },
});

module.exports = mongoose.model("Blog", BlogSchema);
