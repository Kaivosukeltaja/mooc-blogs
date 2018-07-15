const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const helper = require('./test_helper')
const { listWithManyBlogs } = require('./data/blogs')
const Blog = require('../models/blog')

describe('blogs api', () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = listWithManyBlogs.map(n => new Blog(n))
    await Promise.all(blogObjects.map(n => n.save()))
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Test blog',
      author: 'Test author',
      url: 'test-blog',
      likes: 10
    }

    const blogsBefore = await helper.blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.blogsInDb()

    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
    expect(blogsAfter).toContainEqual(newBlog)
  })

  test('blog likes default to 0 if omitted', async () => {
    const newBlogWithoutLikes = {
      title: 'Unliked blog',
      author: 'Nobody cares',
      url: 'meh-whatever'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('adding a blog without title should fail', async () => {
    const newBlogWithoutTitle = {
      author: 'Who knows',
      url: 'missing-title',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitle)
      .expect(400)
  })

  test('adding a blog without url should fail', async () => {
    const newBlogWithoutUrl = {
      title: 'No URL',
      author: 'Someone who dislikes URLs',
      likes: 6
    }

    await api
      .post('/api/blogs')
      .send(newBlogWithoutUrl)
      .expect(400)
  })

  describe('deleting a blog', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'test blog for DELETE',
        author: 'none',
        url: 'test-delete'
      })
      await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfterOperation = await helper.blogsInDb()

      const titles = blogsAfterOperation.map(r => r.titles)

      expect(titles).not.toContain(addedBlog.title)
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
    })
  })

  test('a blog can be edited', async () => {
    const blog = await helper.oneBlogInDb({}, true)
    const initialLikes = blog.likes
    const expectedLikes = initialLikes + 1

    const updatedBlog = new Blog({ ...blog, likes: expectedLikes })

    await api
      .put(`/api/blogs/${blog._id}`)
      .send(updatedBlog)
      .expect(200)

    const blogAfterEdit = await helper.oneBlogInDb({ _id: blog._id })
    expect(blogAfterEdit.likes).toBe(expectedLikes)
  })

  afterAll(() => {
    server.close()
  })
})
