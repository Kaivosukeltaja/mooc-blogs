const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const helper = require('./test_helper')
const { listWithManyBlogs } = require('./data/blogs')
const Blog = require('../models/blog')
const User = require('../models/user')

const testUserCredentials = {
  username: 'blogs-api-test-user',
  password: 'testuserpw123'
}

const loginUser = async () => {
  const response = await api
    .post('/api/login')
    .send(testUserCredentials)
    .expect(200)

  return response.body
}

describe('blogs api', () => {
  beforeAll(async () => {
    await Blog.remove({})
    await User.remove({})

    await api.post('/api/users').send(testUserCredentials)

    const blogObjects = listWithManyBlogs.map(n => new Blog(n))
    await Promise.all(blogObjects.map(n => n.save()))
  })

  describe('when not authenticated', async () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('users are returned as json', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toContainEqual({ blogs: expect.any(Array), username: testUserCredentials.username })
    })

    test('POST /api/users succeeds with a fresh username', async () => {
      const usersBeforeOperation = await helper.usersInDb()

      const newUser = {
        username: 'kaivosukeltaja',
        name: 'Niko Salminen',
        password: 'salminenEikuSalainen',
        adult: false
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAfterOperation = await helper.usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
      const usernames = usersAfterOperation.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
      const usersBeforeOperation = await helper.usersInDb()
      const existingUser = await helper.oneUserInDb()

      const newUser = {
        username: existingUser.username,
        name: 'Superuser',
        password: 'salainen'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'username must be unique' })

      const usersAfterOperation = await helper.usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

    test('POST /api/users fails with proper statuscode and message if username is too short', async () => {
      const usersBeforeOperation = await helper.usersInDb()

      const newUser = {
        username: 'me',
        name: 'Superuser',
        password: 'salainen'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'username is too short' })

      const usersAfterOperation = await helper.usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

    test('blog can be commented', async () => {
      const testComment = { text: 'One for uncle Bob' }
      const blogToComment = await helper.oneBlogInDb({ author: 'Robert C. Martin' }, true)

      const response = await api
        .post(`/api/blogs/${blogToComment._id}/comments`)
        .send(testComment)
        .expect(200)

      expect(response.body.comments).toContainEqual(testComment)
    })

    test('commenting nonexistent blogs should fail', async () => {
      const testComment = { text: 'Nobody will ever see this' }

      await api
        .post('/api/blogs/blogidthatdoesntexist/comments')
        .send(testComment)
        .expect(400)
    })

    test('deleting blogs should fail', async () => {
      const blogToDelete = await helper.oneBlogInDb({ author: 'Robert C. Martin' }, true)

      await api
        .delete(`/api/blogs/${blogToDelete._id}`)
        .expect(401)
    })
  })

  describe('logging in', async () => {
    test('should succeed with correct credentials', async () => {
      await api
        .post('/api/login')
        .send(testUserCredentials)
        .expect(200)
    })

    test('should fail with wrong credentials', async () => {
      await api
        .post('/api/login')
        .send({ username: 'foobar', password: 'betyoucannotrememberthisone' })
        .expect(401)
    })
  })

  describe('when authenticated', async () => {
    let auth = {}
    beforeAll(async () => {
      auth = await loginUser()
      console.log('Authenticated user', auth)
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
        .set('Authorization', 'Bearer ' + auth.token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfter = await helper.blogsInDb()

      expect(blogsAfter.length).toBe(blogsBefore.length + 1)
      expect(blogsAfter).toContainEqual({ ...newBlog, comments: expect.anything(), user: expect.anything() })
    })

    test('blog likes default to 0 if omitted', async () => {
      const newBlogWithoutLikes = {
        title: 'Unliked blog',
        author: 'Nobody cares',
        url: 'meh-whatever'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer ' + auth.token)
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
        .set('Authorization', 'Bearer ' + auth.token)
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
        .set('Authorization', 'Bearer ' + auth.token)
        .send(newBlogWithoutUrl)
        .expect(400)
    })

    describe('deleting a blog', async () => {
      let addedBlog

      beforeAll(async () => {
        const blogToAdd = {
          title: 'test blog for DELETE',
          author: 'none',
          url: 'test-delete'
        }
        addedBlog = await api
          .post('/api/blogs')
          .set('Authorization', 'Bearer ' + auth.token)
          .send(blogToAdd)
          .expect(201)

        addedBlog = addedBlog.body
      })

      test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
        const blogsAtStart = await helper.blogsInDb()

        await api
          .delete(`/api/blogs/${addedBlog._id}`)
          .set('Authorization', 'Bearer ' + auth.token)
          .expect(204)

        const blogsAfterOperation = await helper.blogsInDb()

        const titles = blogsAfterOperation.map(r => r.titles)

        expect(titles).not.toContain(addedBlog.title)
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
      })


      test('DELETE /api/blogs/:id fails if blog belongs to someone else', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const otherBlog = await helper.oneBlogInDb({ author: 'Robert C. Martin' }, true)

        await api
          .delete(`/api/blogs/${otherBlog._id}`)
          .set('Authorization', 'Bearer ' + auth.token)
          .expect(403)

        const blogsAfterOperation = await helper.blogsInDb()
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
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

    test('editing nonexistent blogs should fail', async () => {
      const blog = new Blog({
        title: 'Not a real blog',
        author: 'Nobody',
        url: 'nowhere',
      })

      await api
        .put('/api/blogs/123123123abcdef')
        .send(blog)
        .expect(400)
    })
  })

  afterAll(async () => {
    await server.close()
  })
})
