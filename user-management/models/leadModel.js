const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    status:{
        type:Boolean,
        required:true
    },
    relatedContact:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contact'
    },
    relatedUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    relatedAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account'
    }

    // products
    
});

module.exports = mongoose.model('Lead',leadSchema);