const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    permissions: [{
        permission_name: { type: String, required: true },
        permission_value: { type: [Number], required: true }
    }]
});

module.exports = mongoose.model('UserPermission',userPermissionSchema);


