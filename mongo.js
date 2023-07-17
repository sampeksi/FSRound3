const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://sampeksi:${password}@fullstackopen.qcnkoqf.mongodb.net/phoneBookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const addPerson = (person) => {
    person.save()
    .then(() => {
      console.log(`Added ${person.name} ${person.number} to the phonebook.`)
      mongoose.connection.close()
      })
      .catch((error) => {
        console.error("Error while adding person:", error);
      })
  }

const listPeople = () => Person.find({}).then(people => {
    console.log("phonebook:")
    people.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })

if (process.argv.length === 3) {
    listPeople()
} else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    addPerson(person)
} else {
    console.log("wrong number of parameters")
}