const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    permission:{
        permission_name:String,
        permission_value: [Number]
    },
});

module.exports = mongoose.model('UserPermission',userPermissionSchema);