const express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
var mongoose = require("mongoose");
var passport = require("passport");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const path = require("path");
const crypto = require("crypto");
var randomstring = require("randomstring");
const mailer = require("../misc/mailer");
const bodyParser = require('body-parser')
const { ensureAuthenticated } = require('../config/auth');

router.use(express.static("public"));

router.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
router.use(bodyParser.json())

//USER MODEL
var User = require("../models/User");
var user = mongoose.model("User");

//LOGIN ROUTER
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

//REGISTER ROUTER
router.get("/register/:user", (req, res) => {
  res.render("register.ejs" , {user : req.params.user});
});

const mongoURI =
  "mongodb+srv://deekshanith325:2515@nithcluster-3ulqy.mongodb.net/uniworks?retryWrites=true&w=majority";
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

//REGISTER HANDLE
router.post("/register/:user", upload.single("file") , async (req, res) => {
    var filename = "https://cdn4.iconfinder.com/data/icons/instagram-ui-twotone/48/Paul-18-512.png"
    if(req.file != undefined){
        var filename = req.file.filename;
    }
  
  // res.json({ file : req.file})
  try {
    const { name, email, password1, password2, imageCaption , contact , address , age , occupation  } = req.body;
    // console.log({ name, email, password1, password2, AdminCode  , filename});

    let errors = [];

    //Check required Fields
    if (!name || !email || !password1 || !password2) {
      errors.push({
        msg: "PLease fill all the fields",
      });
    }

    //Check passwords match
    if (password1 != password2) {
      errors.push({
        msg: "Both passwords do not match",
      });
    }

    //Check password length
    if (password1.length < 6) {
      errors.push({
        msg: "Password should be atleast 6 characters long",
      });
    }

    if (errors.length > 0) {
      //there is an issue
      console.log(errors);
      res.render("register.ejs", {
        errors: errors,
        name: name,
        email: email,
        
      });
    } else {
      //Validation passed
      user.findOne({ email: email }).then((user) => {
        if (user) {
          //user exist
          res.render("register.ejs", {
            errors: [
              {
                msg: "Email is already registered",
              },
            ],
            name: name,
            email: email,
          });
        } else {
          const newUser = new User({
            name: name,
            email: email,
            password: password1,
            filename: filename,
            imageCaption : imageCaption,
            contact : contact,
            address : address,
            age : age,
            occupation : occupation
          });
          var randomString = randomstring.generate();
          newUser.secretToken = randomString;

          //encrypted password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              newUser.password = hash;
              newUser
                .save()
                .then(async (user) => {
                    console.log(req.params.user);
                    if(req.params.user === 'admin'){
                //   compose email
                  const html = `Hi There!
                                <br/>
                                Here is your verification link
                                <br/>
                                Please Verify your admin account
                                <a href="https://dsfunapp.herokuapp.com/users/verify/${user.secretToken}">Click Here</a>
                                <br>
                                Have a Pleasant Day!!`;

                  //send email
                  await mailer.sendEmail(
                    "sharmadeeksha325@gmail.com",
                    user.email,
                    "Please Verify your email!",
                    html
                  );
                  req.flash("success_msg", "Please check your email");
                    }
                    else{
                    req.flash("success_msg", "You are successfully registered wait for Admin approval");
                    }
                  res.redirect("/users/login");
                })
                .catch((err) => {
                  throw err;
                });
            })
          );
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
});

//LOGIN HANDELER
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//logout
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
  // res.redirect('/');
});

router.get('/verify/:token' , async (req , res)=>{
    const secretToken = req.params.token;
    // res.send(secretToken);
    const user = await User.findOne({ 'secretToken' : secretToken});
    if(!user){
        req.flash('error' , 'SOMETHNG WENT WRONG , PLEASE REGISTER AGAIN');
        res.redirect('/users/register');
        return;
    }
    user.isAdmin = true;
    user.isActive = true;
    user.secretToken = '';
    await user.save();
    req.flash('success_msg' , 'YOUR ACCOUNT IS VERIFIED , You may login');
    res.redirect('/users/login');

})

router.get('/all-users' , async (req , res)=>{
    // res.send('all');
    const data = await user.find({isActive : true});
    res.render('All-users.ejs' , {data : data});
})


router.get('/deleter/:id' , ensureAuthenticated , async(req , res)=>{
    await user.findByIdAndRemove(req.params.id);
    res.redirect('/users/view-requests');
})

router.get('/deleteu/:id' , ensureAuthenticated,  async(req , res)=>{
    await user.findByIdAndRemove(req.params.id);
    res.redirect('/users/all-users');
})

router.get('/accept/:id' ,ensureAuthenticated,  async (req , res)=>{
    const u = await user.update(
        {_id: req.params.id}, 
        {isActive : true}
    );
    let data = await user.find({isActive : false});
    res.render('view-requests.ejs' , {data : data});
})



router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });


  router.get('/view-requests' ,ensureAuthenticated,  async(req , res)=>{
      try{
      let data = await user.find({isActive : false});
      res.render('view-requests.ejs' , {data : data});
      }
      catch(e){
          console.log(e);
      }
  })

router.get('/update/:id' ,ensureAuthenticated,  async (req , res)=>{
    let data = await user.findById(req.params.id);
    res.render('update.ejs' , {data : data})
});

router.post('/update/:id',ensureAuthenticated,  async (req , res)=>{
    const { name , occupation , contact , address , age , imageCaption } = req.body;
    // var name = 'abc'
    let data = await user.update(
        {_id : req.params.id },
        {name : name , 
        occupation : occupation,
        contact : contact,
        age : age,
        imageCaption : imageCaption,
        address : address
        }
        )
        console.log(data);
    const up_user = await user.findById(req.params.id);
    console.log(up_user);
    res.render('dashboard.ejs' , {user : up_user});
})

  
module.exports = router;
