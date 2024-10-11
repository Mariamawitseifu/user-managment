const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    website:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    phone:[{
        type:String,
        required:true
    }],
    address:{
        type:String,
        required:true
    },
    parentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
});

module.exports = mongoose.model('Account',accountSchema);