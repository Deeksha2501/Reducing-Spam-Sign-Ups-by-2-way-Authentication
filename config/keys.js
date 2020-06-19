require('dotenv').config();

// var uri = 'mongodb+srv://deekshanith325:2515@nithcluster-3ulqy.mongodb.net/uniworks?retryWrites=true&w=majority';
var uri = process.env.mongo_URI;

module.exports = {
    mongo_URI : uri
}
