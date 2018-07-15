const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  try {
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    response.status(400).json({ error: 'Invalid request' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (error) {
    response.status(400).send({ error: error.toString() })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = new Blog({ ...request.body, _id: request.params.id })
  console.log(blog)
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
    console.log(updatedBlog)
    response.json(updatedBlog)
  } catch (error) {
    console.log(error)
    response.status(400).send({ error: error.toString() })
  }
})

module.exports = blogsRouter
