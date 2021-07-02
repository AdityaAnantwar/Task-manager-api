const mailgun = require('mailgun-js')

const domain = process.env.DOMAIN

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain })

// const data = {
//     from: 'me@samples.mailgun.org',
//     to: 'adityaanantwar123@gmail.com',
//     subject: 'Hello',
//     text: 'Testing mailgun'
// }

// mg.messages().send(data, (error, body) => {
//     console.log(body)
// })

const sendWelcomeEmail = (email, name) => {
    mg.messages().send({
        from: 'me@samples.mailgun.org',
        to: email,
        subject: 'Welcome to Task Manager App',
        text: `Welcome ${name}, let me know your opinion of the app`
    })
}

const sendCancelEmail = (email, name) => {
    mg.messages().send({
        from: 'me@sample.mailgun.org',
        to: email,
        subject: 'We will miss you',
        text: `Thank you for using our app, ${name}`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}