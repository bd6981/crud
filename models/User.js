const mongoose = require('../db/connection');
const schema = mongoose.Schema
const UserSchema - new Schema({
    email: String,
    name: String,
});
const User = mongoose.model('User', UserSchema);
module.exports=User;