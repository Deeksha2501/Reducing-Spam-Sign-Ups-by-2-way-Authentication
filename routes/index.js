const express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.use(express.static("public"));

router.get('/' , (req , res)=>{
    res.render('welcome.ejs')
})

router.get('/dashboard' , ensureAuthenticated ,  (req , res)=>{
    res.render('dashboard.ejs' , {user : req.user})
})



module.exports = router;

