const onlyAdminAccess = async(req,res,next) =>{
    try{
        if (!req.user) {
            return res.status(401).json({
                success: false,
                msg: 'User not authenticated'
            });
        }

        if(req.user.role!= 1){
            return res.status(400).json({
                success: false,
                msg: "You haven't permission to access this route!"
            });
        }
        next();
    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: 'Something went wrong!'
        });
    }
}

module.exports={
    onlyAdminAccess
}
