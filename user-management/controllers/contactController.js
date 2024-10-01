const Contact = require('../models/contactModel')
const { validationResult } = require('express-validator');
// const { param } = require('../routes/commonRoute');

const registerContact = async (req,res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }
        const { title, firstName, lastName,phone,email,description,reportsTo,relatedAccount } = req.body;

        const isExistContact = await Contact.findOne({ phone });

        if (isExistContact) {
            return res.status(400).json({
                success: false,
                msg: 'Phone already exists'
            });
        }

        const contact = new Contact({
            title,
            firstName,
            lastName,
            phone,
            email,
            description,
            reportsTo,
            relatedAccount,
        })

        const contactData = await contact.save();

        return res.status(201).json({
            success: true,
            msg: 'Contact Registered successfully',
            data: contactData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
}


const getContact =async (req,res) => {
    const { id } = req.params;

    try {
        const contact = await Contact.findById(id);

        if (!contact){
            return res.status(404).json({message: 'Contact not found'});
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getContacts = async (req,res) => {
    
    const { page = 1, limit = 10 } = req.query;

    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateContact = async (req,res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }
        
        const updatedContact = await Contact.findByIdAndUpdate(id, updates, {new:true});

        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json(updatedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteContact = async (req,res) => {

    const {id} = req.params;

    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

module.exports = {
    registerContact,
    getContact,
    getContacts,
    updateContact,
    deleteContact,

}





