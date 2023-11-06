const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: "test1",
        author: "sampeksi",
        url: "http://localhost",
        likes: 3
    },
    {
        title: "test2",
        author: "sampeksi",
        url: "http://localhost",
        likes: 2
    },
  ]

const nonExistingId = async () => {
  const blog = new Blog({
    title: "random",
    author: "sampeksi",
    url: "http://localhost",
    likes: 2
    })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const tokenForTest = async () => {
  const users = await User.find({})
  const user = users[0]

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  usersInDb,
  tokenForTest
}