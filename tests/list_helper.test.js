const listHelper = require('../utils/list_helper')
const { listWithManyBlogs, listWithOneBlog } = require('./data/blogs')

describe('list helpers', () => {
  describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    test('when list has many blogs equals the total sum of likes', () => {
      const result = listHelper.totalLikes(listWithManyBlogs)
      expect(result).toBe(36)
    })

    test('when list is empty equals zero', () => {
      const result = listHelper.totalLikes([])
      expect(result).toBe(0)
    })
  })

  describe('favorite blog', () => {
    test('returns the only blog in a list of one', () => {
      const result = listHelper.favoriteBlog(listWithOneBlog)
      expect(result).toEqual(listWithOneBlog[0])
    })

    test('returns the blog with most likes', () => {
      const result = listHelper.favoriteBlog(listWithManyBlogs)
      expect(result).toEqual(listWithManyBlogs[2])
    })
  })

  describe('most blogs', () => {
    test('returns the author with the most blogs', () => {
      const result = listHelper.mostBlogs(listWithManyBlogs)
      expect(result).toEqual({
        author: 'Robert C. Martin',
        blogs: 3
      })
    })

    test('returns the only author in a list of one', () => {
      const result = listHelper.mostBlogs(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        blogs: 1
      })
    })
  })

  describe('most likes', () => {
    test('returns the author with most likes', () => {
      const result = listHelper.mostLikes(listWithManyBlogs)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17
      })
    })

    test('returns the only author in a list of one', () => {
      const result = listHelper.mostLikes(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 5
      })
    })
  })
})
