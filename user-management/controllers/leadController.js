const Lead = require('../models/leadModel');
const { validationResult } = require('express-validator');
const Paginate = require('../services/paginate');


const registerLead = async (req,res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }
        const { status, relatedContact, relatedUser, relatedAccount, leadDate, leadStatus, checkIn, checkOut  } = req.body;

        // Create a new user object
        const lead = new Lead({
            relatedContact,
            relatedUser,
            relatedAccount,
            leadDate,
            leadStatus,
            checkIn,
            status,
        });
        
        const leadData = await lead.save();

        return res.status(201).json({
            success: true,
            msg: 'Lead Registered successfully',
            data: leadData
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
}


module.exports = { 
    registerLead,

}