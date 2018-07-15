const totalLikes = blogs => {
  return blogs.reduce((likes, blog) => {
    return likes + blog.likes
  }, 0)
}

const favoriteBlog = blogs => {
  return blogs.reduce((bestBlog, blog) => {
    return (typeof bestBlog === 'undefined' || blog.likes > bestBlog.likes)
      ? blog
      : bestBlog
  }, undefined)
}

const mostBlogs = blogs => {
  let topAuthor
  const authorPosts = {}
  blogs.forEach(blog => {
    if (typeof authorPosts[blog.author] === 'undefined') {
      authorPosts[blog.author] = 1
    } else {
      authorPosts[blog.author]++
    }
    if (typeof topAuthor === 'undefined' || authorPosts[blog.author] > authorPosts[topAuthor]) {
      topAuthor = blog.author
    }
  })

  return topAuthor ? { author: topAuthor, blogs: authorPosts[topAuthor] } : undefined
}

const mostLikes = blogs => {
  let topAuthor
  const authorLikes = {}
  blogs.forEach(blog => {
    if (typeof authorLikes[blog.author] === 'undefined') {
      authorLikes[blog.author] = blog.likes
    } else {
      authorLikes[blog.author] += blog.likes
    }
    if (typeof topAuthor === 'undefined' || authorLikes[blog.author] > authorLikes[topAuthor]) {
      topAuthor = blog.author
    }
  })

  return topAuthor ? { author: topAuthor, likes: authorLikes[topAuthor] } : undefined
}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
