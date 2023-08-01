require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('body', (req) => {
  const body = req.body
  if (!body || Object.keys(body).length === 0) {
    return ''
  }
  return JSON.stringify(body)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
      })
})

app.post('/api/persons', (req, res, next) => {

  if (req.body.name === undefined) {
    return res.status(400).json({ error: 'name missing' })
  }

  const data = req.body
  const person = new Person({
    "name": data.name,
    "number": data.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
  .catch(error => next(error))
})

app.get('/info', (req, res) => {
   Person.countDocuments()
   .then(number => {
       const date = new Date().toLocaleString();
       res.send(`Phonebook has info for ${number} people<br>Date: ${date}`);
    })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  
    Person.findByIdAndUpdate(req.params.id, 
      {name, number},
      { new: true, runValidators: true, context: 'query' }
      )
      .then(updatedContact => {
        res.json(updatedContact)
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
      .then(result => {
        res.status(204).end()
      })
      .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
