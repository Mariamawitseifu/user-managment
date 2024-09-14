const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:Number,
        default:0 //0 could be for regular users,1 for doctors, etc..
    },

});

module.exports = mongoose.model('User',userSchema);