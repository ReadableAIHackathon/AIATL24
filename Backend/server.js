const { v4: uuidv4 } = require('uuid');
const config = require('./config/config.json')
const cors = require('cors');

const auth = require('./utils/auth')
const getContent = require('./operations/getContent')
const getRecent = require('./operations/getRecent')
const getProgress = require('./operations/getProgress')
const increasePoints = require('./operations/increasePoints')
const getUser = require('./operations/getUser')
const updateUser = require('./operations/updateUser')
const simplify = require('./methods/simplify')

const mongoose = require('mongoose')
mongoose.connect(config.MongoDBURI).then(() => console.log("MongoDB Connected."))

const express = require('express')
const http = require('http')
const app = express()
app.use(cors());
app.use(express.json());

app.post('/user/get', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    if (!req.body?.UserEmail) return res.sendStatus(404)
    res.json(await getUser(req.body))
})

app.post('/user/update', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    let user = await updateUser(req.body)
    res.json(user)
})

app.post('/user/transcript', async (req, res) => {
    console.log(req.body)
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    let user = await increasePoints(req.body)
    res.json(user)
})

app.get('/recent/update', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send('Hello World')
})

app.get('/content/update', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send('Hello World')
})

app.get('/progress/update', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send('Hello World')
})

app.post('/content/get', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401);
    let u = await getContent(req.body)
    return res.json(u);
});

app.get('/records/get', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send(await getContent(req.query, { Sections: 0 }))
})

app.get('/progress/get', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send(await getProgress(req.query))
})

app.get('/recent/get/:userid', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send(await getRecent(req.query))
})

app.get('/content/simplify', async (req, res) => {
    if (!auth(req?.headers?.authorization) || !req?.headers?.authorization) return res.sendStatus(401)
    res.send(await simplify(req.query))
})

const port = config.DBPort;
const httpServer = http.createServer(app);
httpServer.listen(port, () => {
    console.log(`HTTP Server running on http://localhost:${port}`);
});