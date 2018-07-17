const mongoose = require('mongoose')
const skipInit = process.env.NODE_ENV === 'test'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: String,
  adult: { type: Boolean, default: true },
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = user => {
  return {
    username: user.username,
    password: user.password,
    name: user.name,
    blogs: user.blogs,
  }
}

const User = mongoose.model('User', userSchema, 'User', skipInit)

module.exports = User
