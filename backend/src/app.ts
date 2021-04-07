/** @format */

import express from 'express'
import bodyParser from 'body-parser'
import signatureRoutes from './signature/routes'
import authRoutes from './auth/routes'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { getSignature } from './signature/utils'
import HttpError from './common/http-error'

const mongoUrl =
    'mongodb+srv://nearlythere:yn9035768nej@cluster0.a4gtv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const app = express()
const port = 8080 // default port to listen
const staticPath = path.join(__dirname, '..', '..', 'build', 'static')
const publicPath = path.join(__dirname, '..', 'public')
const htmlPath = path.join(staticPath, 'index.html')
app.use(bodyParser.json())
// todo: test this cors package
// app.use(cors())

app.use('/api/signature', signatureRoutes)
app.use('/api/auth', authRoutes)
// app.use(express.static(staticPath))
app.use(express.static(publicPath))
app.use('/static', express.static(staticPath))

// todo: figure out all the routes and "whitelist" them?
app.use((req, res, next) => {
    res.sendFile(htmlPath)
})

// define a route handler for the default home page
app.get('/', async (req, res) => {
    let s = ''
    for (let i = 0; i < 64; i++) {
        s += 'd'
    }
    res.send(s)
})

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404)
    throw error
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!' })
})

mongoose
    .connect(mongoUrl)
    .then(() => {
        // start the Express server
        app.listen(port, () => {
            console.log(`server started at http://localhost:${port}`)
        })
    })
    .catch((e) => {
        console.log(e)
    })