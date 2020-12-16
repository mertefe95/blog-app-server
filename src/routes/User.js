const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { sendVerificationEmail, sendActivatedEmail, sendForgotPassword } = require('../utils/account');
const { uuid } = require('uuidv4');


require('dotenv').config({
    path: `${__dirname}/../../.env`
});

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
            .send({ msg: "User not found."})
    }

    return res
        .status(200)
        .send(user)
})

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user);

    res.json({
        username: user.username,
        id: user._id
    });
});

router.get('/forgot-password/:forgotToken', async (req, res) => {
    const {forgotToken} = req.params
    
    const userK = await User.findOne({ forgotToken })
    
    if (!forgotToken) {
        return res
            .status(400)
            .send({ msg: "Forgot token not found in the URL. Please enter your Forgot Token. "})
    } else if (!userK) {
        return res
            .status(400)
            .send({ msg: "No user found with the related forgot token. Empty or wrong token. "})
    }
    
    return res
        .status(200)
        .send({ msg: "Token valid, please enter your new password. "})
})

router.get('/activation/:activationKey', async (req, res) => {
    const { activationKey } = req.params

    if (!activationKey) {
        return res.status(400).send({ msg: "Activation token missing. " } )
    }

    const user = await User.findOne({ activationKey })

    if (!user) {
        return res.status(404).send({ msg: "User not found with the activation token. "})
    }


    if (!user.activatedDateTime === null) {
        return res.status(404).send({ msg: "User already activated. "})
    }

    const dateNow = Date.now().toString()

    await User.updateOne(
        { activationKey },
        { activatedDateTime: dateNow, lastUpdated: dateNow }
    )
    
    
    await sendActivatedEmail(user)

    return res.status(200).send({ msg: "User succesfully activated. "})
})

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    const digit = /^(?=.*\d)/
    const upperLetter = /^(?=.*[A-Z])/

    if (!username || !email || !password) {
        return res
            .status(400)
            .send({ msg: "Please fill all the credentials. "})
}

if (!validator.isEmail(email) || !email) {
        return res.status(400).send({ msg: 'Please enter a valid email. ' })
}

if (!digit.test(password) || !upperLetter.test(password)) {
    return res
        .status(400)
        .send({ msg: "Please enter a password with at least a number and an uppercase letter."})
} else if (password.length < 8) {
        return res
            .status(400)
            .send({ msg: "Please enter a password that is at least 8 characters or more."})
    }

    try {
        let userExistsByEmail = await User.findOne({ email: email })
        let userExistsByUserName = await User.findOne({ username: username })

        if (userExistsByEmail) {
            return res
                .status(400)
                .send({ msg: "The email is already used."})
            } else if (userExistsByUserName) {
            return res
                .status(400)
                .send({ msg: "Username already being used. Please enter a different username. "})
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


            sendVerificationEmail(user)

        res.status(200).send('Successful registration. Please verify your email. ')
} catch (err) {
        res.status(400).send({ msg: err.message })
    }
})


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body 
    
            if (!email || !password) {
                return res
                    .status(400)
                    .send({ msg: "Please fill the missing fields. "})
            }
    
            const user = await User.findOne({ email  })
            if (!user) {
                return res
                    .status(400)
                    .send({ msg: "An account with this email or username does not exists."})
            } else if (user && user.activatedDateTime === null) {
                return res
                    .status(400)
                    .send({ msg: "Please activate your account from the link we've sent to your email. "})
            } else if (user && user.activatedDateTime) {
                const passwordCompare = await bcrypt.compare(password, user.password)
                if (!passwordCompare) {
                    return res
                        .status(400)
                        .send({ msg: "Wrong or empty password." })
                } else if (passwordCompare) {
                    const token = jwt.sign(
                        {  id: user.id },
                        process.env.SECRET_TOKEN
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
    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
})


router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);
    
        const verified = jwt.verify(token, process.env.SECRET_TOKEN);
        if (!verified) return res.json(false);
    
        const user = await User.findById(verified.id);
        if (!user) return res.json(false);
    
        return res.json({
            username: user.username,
            id: user._id
        });
    } catch (err) {
        res.status(500).json({ msg: err.message })
    }
})
    


router.post("/forgot-password/", async (req, res) => {
    const { email } = req.body
        
    const user = await User.findOne({ email })
        
    try {
        if (!validator.isEmail(email) || !email) {
            return res
                .status(400)
                .send({ msg: "Please enter a valid email. "})
                } else if (!user) {
                    return res
                        .status(404)
                        .send({ msg: 'No account has been found related to that email. '})
                } else if (!user.forgotToken === null || !user.forgotToken === undefined) {
                    return res
                        .status(400)
                        .send({ msg: "Password change mail is already been sent. Please check your email."})
                } else if (user || user.forgotToken === null || user.forgotToken === undefined) {
                    
                    const forgotT = uuidv4()

                    await user.updateOne({ forgotToken: forgotT })
        
                    await sendForgotPassword(user, forgotT)


                
                return res
                    .status(200)
                    .send("Password change mail has been sent.")
                }} catch (err) {
                return res
                    .status(500)
                    .send({ msg: err.message })
                }
        })
        
    
    router.post('/change-password', async (req, res) => {

        try {
            const { newPassword, forgotToken } = req.body
            const digit = /^(?=.*\d)/
            const upperLetter = /^(?=.*[A-Z])/
    
            if (!newPassword || !forgotToken) {
            return res
                .status(400)
                .send({ msg: "Please enter your new password and your forgot password key token."})
            } 
        
            const userK = await User.findOne({ forgotToken })
    
            if (!userK) {
            return res.status(400).send({
                msg: 'Token does not match. Enter the valid token.'
            })}
    
            if (newPassword && userK){
            if (!digit.test(newPassword) || !upperLetter.test(newPassword)) {
            return res.status(400).send({
                msg:
                'Please enter at least a number and an uppercase letter with your password.',
            })} else if (newPassword.length < 8) {
            return res.status(400).send({
                msg: 'Please enter a password that is at least 8 or more characters.',
            })} else if (digit.test(newPassword) && upperLetter.test(newPassword) && !(newPassword.length < 8) ) {
    
    
            let encNewPassword = ''
            let theNewSalt = await bcrypt.genSalt(10)
            encNewPassword = await bcrypt.hash(newPassword, theNewSalt)
    
            await userK.updateOne({ password: encNewPassword, forgotToken: null  })
    
            return res.status(200).send("Password has been successfully changed.")
            }
            }} catch (err) {
            return res.status(500).send({ msg: err.message })
            }
    })
    
    
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
    
        if (!user) {
            return res.status(404).send()
        }
    
        res
            .status(200)
            .send(user)
        } catch (e) {
        res.status(500).send()
        }
    })



module.exports = router;