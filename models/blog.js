if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const config = require('../utils/config')
const mongoose = require('mongoose')

const url = config.mongoUrl

mongoose.connect(url)

const Blog = mongoose.model('Blog', {
  title: { type: String, required: true },
  author: String,
  url: { type: String, required: true },
  likes: { type: Number, default: 0 }
})

module.exports = Blog
