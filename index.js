const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // para form data

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// ---------------- In-memory storage ----------------
let users = []  // { username: "abc", _id: "1" }
let exercises = [] // { userId: "1", description, duration, date }
let nextId = 1

// ---------------- Crear usuario ----------------
app.post('/api/users', (req, res) => {
  const { username } = req.body
  if (!username) return res.json({ error: 'Username required' })

  const user = { username, _id: String(nextId++) }
  users.push(user)
  res.json(user)
})

// ---------------- Listar usuarios ----------------
app.get('/api/users', (req, res) => {
  res.json(users)
})

// ---------------- Agregar ejercicio ----------------
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body

  const user = users.find(u => u._id === _id)
  if (!user) return res.json({ error: 'User not found' })

  const exerciseDate = date ? new Date(date) : new Date()
  const exercise = {
    userId: _id,
    description,
    duration: Number(duration),
    date: exerciseDate
  }

  exercises.push(exercise)

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  })
})

// ---------------- Obtener log ----------------
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  const user = users.find(u => u._id === _id)
  if (!user) return res.json({ error: 'User not found' })

  let log = exercises
    .filter(e => e.userId === _id)
    .filter(e => {
      if (from && new Date(from) > e.date) return false
      if (to && new Date(to) < e.date) return false
      return true
    })

  if (limit) log = log.slice(0, Number(limit))

  const formattedLog = log.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }))

  res.json({
    _id: user._id,
    username: user.username,
    count: formattedLog.length,
    log: formattedLog
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
