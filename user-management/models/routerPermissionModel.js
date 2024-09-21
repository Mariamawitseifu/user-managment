const mongoose = require('mongoose');

const routerPermissionSchema = new mongoose.Schema({
    router_endpoint:{
        type:String,
        required:true,
    },
    role:{
        type:Number,
        default:0
    },
    permission_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Permission'
    },
    permission:{
        type:Array,
        default:0
    },
});

module.exports = mongoose.model('RouterPermission',routerPermissionSchema);