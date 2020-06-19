require('dotenv').config();


var uri = process.env.mongo_URI;

module.exports = {
    mongo_URI : uri
}
