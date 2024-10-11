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
    },
    leadDate:{
        type:Date,
        required:true
    },
    checkIn: {
        location: {
            type: String, // Assuming location is a string, change as needed
            required: false
        },
        time: {
            type: Date, // Assuming you want to store the time as a Date
            required: false
        }
    },
    checkOut: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    },    
    leadStatus: {
        type: String, // Change this to your actual enumerator type
        required: true
    },
    // leadStatus:{
    //     type:Enumerator,
    //     required:true
    // },

    //cotravellers

    // products
    
});

module.exports = mongoose.model('Lead',leadSchema);