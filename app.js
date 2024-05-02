const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/users');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const EasyHighScores = require('./models/easyHighScores');
const MediumHighScores = require('./models/mediumHighScores');
const HardHighScores = require('./models/hardHighScores');
require('dotenv').config();

const saltRounds = 10;

//express app
const app = express();

//set ejs up
app.set('view engine', 'ejs');
app.set('views', 'website');

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({extrended: true}));
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(cookieParser());

app.use(session({
    key: "userId",
    secret: "thisisasecretkeyforderekssnakewebsiteyesitis",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60*60*24*7*1000,
    },
}))

const port = 3000;

//connecting to database
const DBlogin = '';
//const DBlogin = ''
mongoose.connect(DBlogin, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));
//app.listen(3000)

//get requests
//web page requests
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user[0].level === "admin") {
            res.render('index', {perms: "admin"});
        } else if (req.session.user[0].level === "moderator") {
            res.render('index', {perms: "mod"});
        } else {
            res.render('index', {perms: "none"});
        }
    } else {
        res.render('index', {perms: "none"});
    }
})

app.get('/index.ejs', (req, res) => {
    if (req.session.user) {
        /* get ip code*/
        /*
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => console.log(data.ip));
        */
        /**/
        if (req.session.user[0].level === "admin") {
            res.render('index', {perms: "admin"});
        } else if (req.session.user[0].level === "moderator") {
            res.render('index', {perms: "mod"});
        } else {
            res.render('index', {perms: "none"});
        }
    } else {
        res.render('index', {perms: "none"});
    }
})

app.get('/login.ejs', (req, res) => {
    res.render('login', {failed: '', failed2: ''});
})

app.get('/registered.ejs', (req, res) => {
    res.render('registered');
})

//is user logged in
app.get("/is-logged-in", (req, res) => {
    if (req.session.user) {
        //res.send({loggedIn: true, user: req.session.user })
        const data = {
            "loggedIn": true,
            "username": req.session.user[0].username,
            "discord": req.session.user[0].discord,
            "level": req.session.user[0].level
        }
        res.send(JSON.stringify(data));
    } else {
        //res.sendStatus({loggedIn: false});
        const data = {
            "loggedIn": false
        }
        res.send(JSON.stringify(data));
    }
})

function sortScores(scores) {
    let sortedList = [];
    while (scores.length > 0) {
        let lowest = 0;
        let lowestScore = scores[0].score;
        for (let i = 0; i < scores.length; i++) {
            if (lowestScore < scores[i].score) {
                lowestScore = scores[i].score;
                lowest = i;
            }
        }
        sortedList.push(scores[lowest]);
        scores.splice(lowest, 1);
    }
    return sortedList;
}

//send high scores
app.get("/getScores", (req, res) => {
    let data = {
        easy: [],
        medium: [], 
        hard: [],
    }
    EasyHighScores.find()
        .then(easyRes => {
            data.easy = sortScores(easyRes);
            MediumHighScores.find()
                .then(medRes => {
                    data.medium = sortScores(medRes);
                    HardHighScores.find()
                        .then(hardRes => {
                            data.hard = sortScores(hardRes);
                            res.send(JSON.stringify(data));
                        })
                })
        })
})

//post requests
//signup post request
app.post('/add-user', (req, res) => {
    username = req.body.username.toLowerCase();
    password = req.body.password;
    //check if username exists
    User.find({username: {$all: [username]}})
        .then(result => {
            if (result.length === 0) {//if user doesnt exist
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        console.log(err);
                        res.redirect('login.ejs');
                    } else {
                        const user = new User();
                        user.username = username.toLowerCase();
                        user.password = hash;
                        user.level = "user";
                        user.save()
                            .then((result) => {
                                res.redirect('registered.ejs');
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                })
            } else {//username is taken
                res.render('login', {failed: '', failed2: 'Username is taken'});
            }
        })
        .catch(err => {//error on username search
            console.log(err)
        })
})

//login post request
app.post('/login-user', (req, res) => {
    username = req.body.username.toLowerCase();
    password = req.body.password;
    User.find({username: {$all: [username]}})
        .then(result => {
            bcrypt.compare(password, result[0].password, (error, response) => {
                if (response) {
                    //console.log("Successful login");
                    req.session.user = result;
                    res.redirect('index.ejs');
                } else {
                    //console.log("Incorrect Password");
                    res.render('login', {failed: 'Incorrect Password', failed2: ''});
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.redirect('login.ejs');
        })
})

function checkIfHigher(x, highScores) {
    let posLowest = 0;
    for (let i = 1; i < highScores.length; i++) {
        if (highScores[posLowest].score > highScores[i].score) {
            posLowest = i;
        }
    }

    if (x.score > highScores[posLowest].score) {
        return true, highScores[posLowest];
    }
    return false, highScore[posLowest];
}

function deleteHighScore(x, record) {
    if (x.difficulty === 'easy') {
        EasyHighScores.deleteOne({score: record.score})
            .then(deleted => {
                addHighScore(x);
            })
            .catch(err => {
                console.log(err);s
            })
    } else if (x.difficulty === 'medium') {
        MediumHighScores.deleteOne({score: record.score})
            .then(deleted => {
                addHighScore(x);
            })
            .catch(err => {
                console.log(err);s
            })
    } else {
        HardHighScores.deleteOne({score: record.score})
            .then(deleted => {
                addHighScore(x);
            })
            .catch(err => {
                console.log(err);s
            })
    }
}

function addHighScore(x) {
    let highScore;
    if (x.difficulty === 'easy') {
        highScore = new EasyHighScores();
    } else if (x.difficulty === 'medium') {
        highScore = new MediumHighScores();
    } else {
        highScore = new HardHighScores();
    }
    highScore.name = x.user;
    highScore.score = x.score;
    highScore.save()
        .then((result) => {
            
        })
        .catch((err) => {
            console.log(err);
        });
}

//makeMod post request
app.post('/sendScore', (req, res) => {
    if (req.body.difficulty === 'easy') {
        EasyHighScores.find() //Use easy dif high scores
            .then(response => {
                let replace, record = checkIfHigher(req.body, response);
                if (!replace) {
                    deleteHighScore(req.body, record);
                }
            })
            .catch(err => {
                console.log(err);
            })
    } else if (req.body.difficulty === 'medium') {
        MediumHighScores.find() //Use medium dif high scores
            .then(response => {
                let replace, record = checkIfHigher(req.body, response);
                if (!replace) {
                    deleteHighScore(req.body, record);
                }
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        HardHighScores.find() //Use hard dif high scores
            .then(response => {
                let replace, record = checkIfHigher(req.body, response);
                if (!replace) {
                    deleteHighScore(req.body, record);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
    res.send('True');
})

//404 page
app.use((req, res) => {
    res.status(404).render('404');
})
