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

const sendForgotPassword = (user) => {
    const url = `http://localhost:3000/change-password/${user.forgotToken}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Forgot password mail",
        html: `Forgot Password Mail Test <a href=${url}> ${url} </a>`
    })
}

const sendActivatedEmail = (user) => {

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}`,
        subject: "Your Email has been Activated",
        html: `Your Email has been activated. Please visit our homepage.`
    })
}

const sendConfirmationEmail = (user) => {
    const url = `http://localhost:8080/api/activation/${user.activationKey}`

    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: `<${user.email}>`,
        subject: "Confirmation Email",
        html: `Confirmation Email testing :) <a href=${url}> ${url}</a>`
    })
}

module.exports = {
    sendConfirmationEmail,
    sendActivatedEmail,
    sendForgotPassword
}