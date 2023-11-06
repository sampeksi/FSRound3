  const blogsRouter = require('express').Router()
  const Blog = require('../models/blog')
  const User = require('../models/user')
  const jwt = require('jsonwebtoken')

  blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 , id: 1})

    response.json(blogs)
  })
  
  blogsRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = request.user

    if (!decodedToken.id || decodedToken.id !== user.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    const populatedBlog = await Blog.findById(savedBlog._id)
      .populate('user', { username: 1, name: 1 })

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(populatedBlog)
  })

  blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = request.user

    if (!decodedToken.id || decodedToken.id !== user.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const savedBlog = await Blog.findByIdAndUpdate(request.params.id, {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }, {
        new: true, runValidators: true, context: 'query'
    })

    response.json(savedBlog)
  })

  blogsRouter.delete('/:id', async (request, response, next) => {
    const blog = await Blog.findById(request.params.id);
    
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    const u = request.user;
    console.log('Request token:', request.token);
    console.log('Decoded token ID:', decodedToken.id);
    console.log('Blog user ID:', blog.user.toString());

    if (!decodedToken.id || decodedToken.id !== blog.user.toString()) {
        return response.status(401).json({ error: 'token invalid' });
    }

    try {
        await Blog.findByIdAndRemove(request.params.id);
        u.blogs = u.blogs.filter(b => b.id !== blog.id);
        await u.save();
        response.status(204).end();
    } catch (exception) {
        next(exception);
    }
  });

  module.exports = blogsRouter