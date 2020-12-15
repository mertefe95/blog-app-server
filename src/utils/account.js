const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')
require('dotenv').config({
    path: `${__dirname}/../../.env`
});

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
)

const sendForgotPassword = (user, forgotT) => {
    const url = `https://blog-app-client.vercel.app/change-password/${forgotT}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Forgot password mail",
        html: `Please click the link to change your password. <a href=${url}> ${url} </a>`
    })
}

const sendActivatedEmail = (user) => {
    const url = `https://blog-app-client.vercel.app/login`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Your Email has been Activated",
        html: `Your Email has been activated. You may go to our web page and proceed to login. <a href=${url}> ${url}</a>`
    })
}

const sendVerificationEmail = (user) => {
    const url = `https://blog-app-client.vercel.app/user-activated/${user.activationKey}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}>`,
        subject: "Verification Email",
        html: `Please click the link to verify your email. <a href=${url}> ${url}</a>`
    })
}

module.exports = {
    sendVerificationEmail,
    sendActivatedEmail,
    sendForgotPassword
}