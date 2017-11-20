var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var routes = require('./routes');

var index = require('./routes/index');
var users = require('./routes/users');
var signup = require('./routes/signup');
var login = require('./routes/login');
var posts = require('./routes/posts');
var chat = require('./routes/chat');
var community = require('./routes/community');
var http = require('http')
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        console.log("file info:"+file);
        fName=file.originalname;
        cb(null, fName)
    }
});
app.use(session({ resave: true,
    saveUninitialized: true,
    secret: 'uwotm8' }));

var upload = multer({storage:storage});


app.set('port', process.env.PORT || 9000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


app.use('/users', users);
app.get('/signup', signup.signup);
app.post('/signup', signup.storeuserdetails);
app.post('/postadd',upload.single('addImage'), signup.postadd);
app.get('/login', login.login);
app.post('/login', login.postlogin);
app.get('/logout', login.logout);
app.post('/viewposts', posts.viewposts);
app.post('/userchat',chat.intiatechat);

app.post('/createCommunity', community.createCommunity);
app.post('/updateCommunity', community.updateCommunity);
app.post('/deleteCommunity', community.deleteCommunity);
app.post('/deleteUser', community.deleteUser);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;



