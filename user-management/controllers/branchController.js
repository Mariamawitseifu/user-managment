const { validationResult } = require('express-validator');
const Branch = require('../models/branchModel');


const addBranch = async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(200).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            })
        }
        const {name, location } = req.body;

        const branch = new Branch({
            name: name,
            location: location,
        })

        const branchData = await branch.save();

        return res.status(201).json({
            success: true,
            msg: 'Registered successfully',
            data: branchData
        });
    }catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
    
}

module.exports = {
    addBranch,
}