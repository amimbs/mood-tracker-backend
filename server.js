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

// const cookieParser = require('cookie-parser');
// const session = require('express-session');
const { response } = require('express');

// app.use(cookieParser());
// app.use(session({
//     secret: 'thisisaBIGsectretBoi!',
//     resave: true,
//     saveUninitialized: true,
//     cookie: {
//         secure: false,
//         maxAge: 60000 * 60
//     }
// }));

app.post('/signUp', (req, res) => {
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
            return res.status(200).json({ success: true, user_id: user.id })
        }).catch(e => {
            let errors = [];
            e.errors.forEach(error => {
                errors.push(error.message)
            });
            return res.status(400).json({ error: errors })
        });
    });
});

app.post('/signIn', async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await models.User.findOne({ where: { email: email }, raw: true });
    if (!foundUser) {
        return res.json({ errors: 'invalid email' });
    };
    bcyrpt.compare(password, foundUser.password, (err, match) => {
        if (match) {
            res.json({ success: true, user_id: foundUser.id })
        } else {
            res.json({ error: 'Incorrect Password' })
        };
    });
});

app.get('/dashboard/:user_id', (req, res) => {
    if (!req.params.user_id) {
        res.json({error: 'you dont belong here'})
        return;
    }
    res.json({succes: true})
})

app.listen(PORT, () => {
    console.log(`app started on ${PORT}`)
});

