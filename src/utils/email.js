const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid')
require('dotenv').config();

const transport = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
    })
)

const sendForgotPassword = (user) => {
    
    const url = `http://localhost:3000/api/forgot-password/${}`

    transport.sendMail({
        from: process.env.ADMIN_MAIL,
        to: `<${user.email}>`,
        subject: 'Forgot Password Test Email',
        html: `Forgot Password Test Emailing`
    })
}