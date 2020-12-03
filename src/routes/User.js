const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const UserKey = require('../models/UserKey');
const auth = require('../middleware/auth');

require('dotenv').config();

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

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
        username: user.username,
        id: user._id,
    });

});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    const digit = /^(?=.*\d)/
    const upperLetter = /^(?=.*[A-Z])/

    if (!username || !email || !password) {
        return res
            .status(400)
            .send({ error: "Please fill all the credentials. "})
    }


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
        let userExistsByEmail = await User.find({ email: email })
        let userExistsByUserName = await User.find ({ username: username })

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
        const { email, password } = req.body 

        if (!email || !password) {
            return res
                .status(400)
                .send({ error: "Please fill the missing fields. "})
        }

        const user = await User.findOne({ email  })
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
                const token = jwt.sign(
                    { email: user.email, id: user.id },
                    "b7f438b7735800f267494e0b008f8406f84ad9bb72cf7ec687baa5b669427cb0212e8fe5f00bcb5c146c5404a4593ee6"
                );
                    
                return res
                    .status(200)
                    .json({ token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }})
            }
        }
} catch (e) {
    res.status(500).send(e)
}
})

router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, "b7f438b7735800f267494e0b008f8406f84ad9bb72cf7ec687baa5b669427cb0212e8fe5f00bcb5c146c5404a4593ee6");
        if (!verified) return res.json(false);


        const user = await User.find(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }})


router.post("/forgot-password/", async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    try {
        if (!validator.isEmail(email) || !email) {
            return res
                .status(400)
                .send({ error: "Please enter a valid email. "})
        } else if (!user) {
            return res
                .status(404)
                .send({ error: 'No account has been found related to that email. '})
        } else if (user) {
            const userK = new UserKey;
            await userK.save()

            await userK.updateOne({ userId: user.id, keyType: "forgot-password" })

            // sendPassword(user, userK)

            return res
                .status(200)
                .send("Password change mail has been sent.")
        }
        
    } catch (e) {
        return res
            .status(500)
            .send()
    }

})





module.exports = router;