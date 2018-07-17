const Blog = require('../models/blog')
const User = require('../models/user')

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(Blog.format)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(User.format)
}

const oneBlogInDb = async (criteria = {}, raw = false) => {
  const blog = await Blog.findOne(criteria)
  return raw ? blog : Blog.format(blog)
}

const oneUserInDb = async (criteria = {}, raw = false) => {
  const user = await User.findOne(criteria)
  return raw ? user : User.format(user)
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'Foo', url: 'bar' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const addTestUser = async () => {
  const user = new User({ username: 'test-user' })
  return await user.save()
}

module.exports = {
  blogsInDb,
  usersInDb,
  nonExistingId,
  oneBlogInDb,
  oneUserInDb,
  addTestUser,
}
