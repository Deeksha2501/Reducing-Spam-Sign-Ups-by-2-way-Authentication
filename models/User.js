const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isAdmin : {
    type : Boolean,
    default : false
  },
  secretToken : {
    type : String
  },
  isActive : {
    type : Boolean,
    default : false
  },
  filename : {
    type : String,
    default : 'https://cdn4.iconfinder.com/data/icons/instagram-ui-twotone/48/Paul-18-512.png'
  },
  imageCaption : String,
  contact : String,
  address : String,
  age : Number,
  occupation : String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
