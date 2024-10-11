const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    reportsTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contact'
    },
    relatedAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account'
    }
});

module.exports = mongoose.model('Contact',contactSchema);