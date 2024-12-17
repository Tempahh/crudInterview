// Used for creating the schema for comments
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  }, { timestamps: true });
  
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
