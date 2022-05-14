const express = require('express');
const app = express();
const cors = require('cors');
// We do this because the front end runs on 3000
const PORT = process.env.PORT || 3001;
// heroku gives a port that the app runs on so we set it equal to the environments process to ensure it deploys correctly

// in package.json change the main to the server and add the nodemon script
app.use(express.json());
app.use(cors());
const models = require('./models');
const user = require('./models/user')
const bcyrpt = require('bcrypt');
const saltRounds = 10;

const cookieParser = require('cookie-parser');

app.use(cookieParser());

// middleware 
const validateToken = (req, res, next) => {
    const cookie = req.cookies;
    console.log(cookie);
    // Here we parse the token, get the token value (username, id etc),
    // and then attach to req.body
    req.body.user = 'andy'; 
    next();
};

app.get('/', validateToken, (req, res) => {
    res.cookie('username', 'Mimbs')
    res.json({ hello: `hello ${req.body.user}` })
});

app.post('/signUp', validateToken, (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password || !firstName || !lastName) {
        // need to make this an alert
        return res.json({ error: 'Email, password, first and last name are required' });
    }

    bcyrpt.hash(password, saltRounds, (err, hash) => {
        models.User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hash
        }).then((user) => {
            console.log(user);
            return res.status(200).json({ success: true })
        }).catch(e => {
            let errors = [];
            console.log(e)
            e.errors.forEach(error => {
                errors.push(error.message)
            });
            return res.status(400).json({ error: errors })
        });
    });
});

app.post('/signIn', validateToken, async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await models.User.findOne({ where: { email: email }, raw: true });
    if (!foundUser) {
        return res.json({ errors: 'invalid email' });
    };
    bcyrpt.compare(password, foundUser.password, (err, match) => {
        if (match) {
            req.User = foundUser
            res.json({ success: true })
        } else {
            res.json({ error: 'Incorrect Password' })
        };
    });
});

app.listen(PORT, () => {
    console.log(`app started on ${PORT}`)
});

