const checkPermission = async (req,res, next) => {
    try {

        if(req.user.role !=1){
            const routerPermission = await helper.getRouterPermission(req.path, req.user.role);
            const userPermission = await helper.getRouterPermission(req.user._id);

            if(userPermissions.permissions.permissions == undefined || !routerPermission){
                return res.status(400).json({
                    success: false,
                    msg: "You haven't permission to access this route!"
                });
            }
            const permission_name = routerPermission.permission_id.permission_name;
            const permission_values = routerPermission.permission;

            const hasPermission = userPermissions.permissions.permissions.some(permission =>
                permission.permission_name == permission_name &&
                permission.permission_value.some(value => permission_values.includes(value))
            );
            if(!hasPermission){
                return res.status(400).json({
                    success: false,
                    msg: "You haven't permission to access this route!"
                });
            }
        }
        return next();

        console.log(req.user);
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: 'Something went wrong'
        });
    }
}

module.exports = checkPermission;