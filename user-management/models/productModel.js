const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Product',productSchema);