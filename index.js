const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
    },
    { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
    },
    { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
    },
    { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
    }
]

app.get('/', (req, res) => {
    morgan.token('body', () => "")
    res.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (req, res) => {
    morgan.token('body', () => "")
        res.json(persons)
})

app.post('/api/persons', (req, res) => {
    morgan.token('body', request => JSON.stringify(request.body))
    
    if (!req.body.name) {
        return res.status(400).json({ 
            error: 'name missing' 
          })
    }
    if (!req.body.number) {
        return res.status(400).json({ 
            error: 'number missing' 
          })
    }
    const id = Math.floor(Math.random() * 99) + 1
    const data = req.body
    const found = persons.find(person => person.name === data.name)
    if (found) {
        return res.status(400).json({ 
            error: 'name already exists' 
          }) 
    }
    const person = {
        "name": data.name,
        "number": data.number,
        "id": id
    }
    persons = persons.concat(person)
    res.json(person)
})

app.get('/info', (req, res) => {
    const numbers = persons.length
    const date = new Date().toLocaleString()
    morgan.token('body', () => "")
    res.send('Phonebook has info for ' + numbers + ' people<br>Date: ' + date)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.filter(person => person.id === id)
    morgan.token('body', () => "")
    if (person.length > 0) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    morgan.token('body', () => "")
    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})