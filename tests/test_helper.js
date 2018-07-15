const Blog = require('../models/blog')

const format = blog => {
  return {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
  }
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(format)
}

const oneBlogInDb = async (criteria = {}, raw = false) => {
  const blog = await Blog.findOne(criteria)
  return raw ? blog : format(blog)
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'Foo', url: 'bar' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

module.exports = {
  format,
  blogsInDb,
  nonExistingId,
  oneBlogInDb,
}
