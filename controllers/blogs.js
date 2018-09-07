const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  if (!blog.title) {
    return response.status(400).json({ error: 'title is mandatory' })
  }
  if (!blog.url) {
    return response.status(400).json({ error: 'url is mandatory' })
  }
  try {
    const decodedToken = request.token ? jwt.verify(request.token, process.env.SECRET) : null

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    blog.user = user._id
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
  catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'unexpected error' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const blogToDelete = await Blog.findById(request.params.id)
    const decodedToken = request.token ? jwt.verify(request.token, process.env.SECRET) : null

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (!blogToDelete.user || blogToDelete.user.toString() !== decodedToken.id) {
      return response.status(403).json({ error: 'blog belongs to other user' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    console.log('Delete failed', error.toString())
    response.status(500).send({ error: error.toString() })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = new Blog({ ...request.body, _id: request.params.id })
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
    response.json(updatedBlog)
  } catch (error) {
    response.status(400).send({ error: error.toString() })
  }
})

blogsRouter.post('/:id/comments', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (!Array.isArray(blog.comments)) {
      blog.comments = []
    }
    blog.comments.push(request.body)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
    response.json(updatedBlog)
  } catch (error) {
    response.status(400).send({ error: error.toString() })
  }
})

module.exports = blogsRouter
