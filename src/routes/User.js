const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

router.get('/users', async (req, res) => {
    const users = await User.find({})

    if (!users) {
        return res
            .status(400)
            .send({error: "No user has been found."})
    }

    return res
        .status(200)
        .send(users)
})

router.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return res
            .status(400)
            .send({ error: "User not found."})
    }

    return res
        .status(200)
        .status(user)
})

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    const digit = /^(?=.*\d)/
    const upperLetter = /^(?=.*[A-Z])/

    if (!validator.isEmail(email) || !email) {
        return res.status(400).send({ error: 'Please enter a valid email. ' })
    }

    if (!digit.test(password) || !upperLetter.test(password)) {
        return res
            .status(400)
            .send({ error: "Please enter a password with at least a number and an uppercase letter."})
    } else if (password.length < 8) {
        return res
            .status(400)
            .send({ error: "Please enter a password that is at least 8 characters or more."})
    }

    try {
        let userExistsByEmail = await User.find({ email })
        let userExistsByUserName = await User.find ({ username })

        if (userExistsByEmail.length > 1) {
            return res
                .status(400)
                .send({ error: "The email is already used."})
        } else if (userExistsByUserName.length > 1) {
            return res
                .status(400)
                .send({ error: "Please enter a different username. "})
        }

        let encPassword = ''
        let theSalt = await bcrypt.genSalt(10)
        encPassword = await bcrypt.hash(password, theSalt)

        let registrationRequest = {
            username,
            email,
            password: encPassword
        }

        const user = new User(registrationRequest)
        await user.save()

        res.status(200).send('Successful registration.')
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body 

        const user = await User.findOne({ email, username })
        if (!user) {
            return res
                .status(400)
                .send({ error: "An account with this email or username does not exists."})
        } else if (user) {
            passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res
                    .status(400)
                    .send({ error: "Wrong or empty password." })
            } else if (passwordCompare) {
                const token = await jwt.sign(
                    { email: user.email, id: user.id },
                    process.env.SECRET_TOKEN
                )

                return res
                    .status(200)
                    .json({ token: token })
            }
        }
} catch (e) {
    res.status(500).send(e)
}
})


module.exports = router;