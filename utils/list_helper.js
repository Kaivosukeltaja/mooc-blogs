const totalLikes = blogs => {
  return blogs.reduce((likes, blog) => {
    return likes + blog.likes
  }, 0)
}

module.exports = {
  totalLikes
}
