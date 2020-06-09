// module.exports = {
//     MAILGUN_USER : 'postmaster@sandboxe98a750f8e4d473c8d9e3f1b35d95c11.mailgun.org',
//     MAILGUN_PASS : 'af9b954bd91e74e2b1f41b1f357ec106-8b34de1b-b612c022'
// }

require('dotenv').config();
module.exports = {
    MAILGUN_USER : process.env.mail_user2,
    MAILGUN_PASS : process.env.mail_pass2
}
