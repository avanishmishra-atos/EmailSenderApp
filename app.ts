const { OAuth2Client } = require('google-auth-library');
const nodemailer = require("nodemailer");

const keys = require('./oauth2.keys.json');

const args = require('yargs')
    .option('to', {
        type: 'array',
        desc: 'One or more recipient'
    })
    .argv;

async function sendEmail() {
    // variable to hold refresh token from env variable
    const refresh_token = process.env.REFRESH_TOKEN

    // create auth client
    const oAuth2Client = await new OAuth2Client(
        keys.web.client_id,
        keys.web.client_secret,
        keys.web.redirect_uris[0]
    );

    // get refresh token in auth client
    oAuth2Client.setCredentials({
        refresh_token: refresh_token
    });

    // get access token
    const tokens = await oAuth2Client.getAccessToken();

    // create smtp transport using auth2 authentication
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: args.from,
            clientId: keys.web.client_id,
            clientSecret: keys.web.client_secret,
            refreshToken: refresh_token,
            accessToken: tokens.token
        }
    });

    // prepare mail option
    const mailOptions = {
        from: args.from,
        to: args.to,
        subject: args.subject,
        generateTextFromHTML: false,
        html: args.content
    };

    // send mail
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response.response);
        smtpTransport.close();
    });
}

sendEmail();