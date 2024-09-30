const checkPermission = async (req, res, next) => {
    try {
        if (req.user.role !== 1) {
            const routerPermission = await helper.getRouterPermission(req.user.role, req.path);
            const userPermissions = await helper.getUserPermissions(req.user._id);

            if (!userPermissions.permissions || !routerPermission) {
                return res.status(400).json({
                    success: false,
                    msg: "You don't have permission to access this route!"
                });
            }

            const permissionName = routerPermission.permission_id.permission_name;
            const permissionValues = routerPermission.permission;

            const hasPermission = userPermissions.permissions.permissions.some(permission =>
                permission.permission_name === permissionName &&
                permission.permission_value.some(value => permissionValues.includes(value))
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    msg: "You don't have permission to access this route!"
                });
            }
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Something went wrong'
        });
    }
};

module.exports = { checkPermission }