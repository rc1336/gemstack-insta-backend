const express = require('express')
const User = require('../db/models/User')
const Auth = require('../authService/middleware/Auth')

const router = express.Router()

router.post('/new', async (req, res) => {
    // Create a new user
    try {
        let hey = 'hello'
        const user = new User(req.body)
        await user.save()
        // await console.log("done" + user)
        const token = await user.generateAuthToken()
        res.status(201).send({ hey, user, token })
    } catch (error) {
        res.status(420).send(error)
        console.log(error)
    }
})

router.post('/login', async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/token', async (req, res) => {
    //Login a registered user
    try {
        const { token } = req.body
        // const user = await User.findByCredentials(email, password)
        const user = await User.find({
            "tokens.token": token
        })
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        // const token = await user.generateAuthToken()
        res.send({ user })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/me', Auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/me/logout', Auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/logoutall', Auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router