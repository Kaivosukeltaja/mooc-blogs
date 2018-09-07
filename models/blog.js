const mongoose = require('mongoose')
const skipInit = process.env.NODE_ENV === 'test'
/*
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const config = require('../utils/config')

const url = config.mongoUrl

mongoose.connect(url)
*/
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [mongoose.Schema.Types.Mixed],
})

blogSchema.statics.format = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: blog.user,
    comments: blog.comments,
  }
}

const Blog = mongoose.model('Blog', blogSchema, 'Blog', skipInit)

module.exports = Blog
