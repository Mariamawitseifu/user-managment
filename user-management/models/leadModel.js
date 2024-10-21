const mongoose = require('mongoose');
const LeadStatusEnum = require('../services/enum')


const leadSchema = new mongoose.Schema({
    status:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'LeadStatusEnum'
        // required:false
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
        ref:'Account',
        required:false
    },
    leadDate:{
        type:Date,
        required:false
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
        required: false
    },
    // leadStatus:{
    //     type:Enumerator,
    //     required:true
    // },

    //cotravellers

    // products
    
});

module.exports = mongoose.model('Lead',leadSchema);