const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
      }
    return blogs.length === 0
    ? 0 
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return "there are no posts on the site"
    }
  
    const evaluator = (max, current) => {
      return current.likes > max.likes ? current : max
    }
  
    const mostLiked = blogs.reduce(evaluator, blogs[0])
  
    const { title, author, likes } = mostLiked
    return { title, author, likes }
  }

const mostBlogs = (blogs) => {
    const authorBlogs = _.countBy(blogs, 'author')
    const author = _.maxBy(_.keys(authorBlogs), (a) => authorBlogs[a])
    return {author: author, blogs: authorBlogs[author]}
}

const mostLikes = (blogs) => {
    const authors = _.groupBy(blogs, 'author')
    const authorTotalLikes = _.mapValues(authors, (posts) => _.sumBy(posts, 'likes'));
    const maxAuthor = _.maxBy(_.keys(authorTotalLikes), (author) => authorTotalLikes[author]);
    return {author:maxAuthor, likes:authorTotalLikes[maxAuthor]}
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }