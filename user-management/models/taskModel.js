const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    contact_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:false
    },

    // opportunity_id:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     required:false
    // },
});

module.exports = mongoose.model('Task',taskSchema);