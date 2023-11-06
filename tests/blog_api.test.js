const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

let token = null
  
  beforeEach(async () => {

    const t = await helper.tokenForTest()
    token = "Bearer " + t

    await Blog.deleteMany({})

    await api
    .post('/api/blogs')
    .send(helper.initialBlogs[0])
    .set({ Authorization: token })

    await api
    .post('/api/blogs')
    .send(helper.initialBlogs[1])
    .set({ Authorization: token })

  })

test('there are two blogs on the list', async () => {
    const response = await 
        api.get('/api/blogs')
        .set({Authorization: token})

    expect(response.body).toHaveLength(2)
})

test('blogs are defined using "id"', async () => {
    const response = 
    await api.get('/api/blogs')
    .set({Authorization: token})

    expect(response.body).toBeDefined()

    const blogs = response.body
    blogs.forEach(blog => {
        expect(blog.id).toBeDefined()
    })
})

test('blogs can be added to the database', async () => {
    const newBlog = {
        title: "test3",
        author: "sampeksi",
        url: "http://localhost",
        likes: 5
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: token })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs').set({ Authorization: token })

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
    'test3'
    )
})

test('likes are without definition set to 0', async () => {
    const newBlog = {
        title: "test4",
        author: "sampeksi",
        url: "http://localhost"
      }
    
    await api
    .post('/api/blogs')
    .send(newBlog)
    .set({ Authorization: token })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs').set({ Authorization: token })
    
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(response.body[helper.initialBlogs.length].likes).toBe(0)
})

test('post without url is declined', async () => {
    const newBlog = {
        author: "sampeksi",
        url: "f3ebdifedc"
    }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token })
        .expect(400)

})

test('delete blog based on id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: token })
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length -1)

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
})

test('edit blog based on id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToEdit = blogsAtStart[0]
    
    const newBlog = {
        title: "test3",
        author: "sampeksi",
        url: "http://localhost",
        likes: 5
    }

    await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .send(newBlog)
    .set({ Authorization: token })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).toContain(newBlog.title)
    expect(titles).not.toContain(blogToEdit.title)
})


test('blogs can not be added without token', async () => {
    const newBlog = {
        title: "test3",
        author: "sampeksi",
        url: "http://localhost",
        likes: 5
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

    const response = await api.get('/api/blogs').set({ Authorization: token })
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})