let express = require('express');
var app = express();
const passport = require('passport');


require('./config/passport')(passport);
//Connection with database
const mongoose = require('mongoose')

//connect flash
const flash = require('connect-flash');
const session = require('express-session');

app.use(express.static("public"));

//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

//DB Config
const mongo_uri = require('./config/keys').mongo_URI;
console.log({mongo_uri});

var url = process.env.mongo_URI;

//Connect to mongo
var conn = mongoose.connect(url , { useNewUrlParser: true  , useUnifiedTopology: true} , (err)=>{
    if(!err){
        console.log("Moongoose connect succeded...");
    }
    else{
        console.log("ERROR : " , err);
    }
});


//BodyParser
app.use(express.urlencoded({extended : false}));

//PORT
const PORT = process.env.PORT || 5000;


//ROUTES
app.use('/' , require('./routes/index'))
app.use('/users' , require('./routes/users'))
 
//listening to server
app.listen(PORT , (req , res)=>{
    console.log(`Server has started on port ${PORT}`);
});
