const { validationResult } = require("express-validator");
const RouterPermission = require('../../models/routerPermissionModel');

const getAllRoutes = async (req, res) => {
    try {
        const routes = [];
        const stack = req.app._router.stack;

        stack.forEach(layer => {
            if (layer.route) {
                const methods = layer.route.methods;
                routes.push({
                    path: layer.route.path,
                    methods: Object.keys(methods).map(method => method.toUpperCase())
                });
            } else if (layer.handle && layer.handle.stack) {
                layer.handle.stack.forEach(handler => {
                    if (handler.route) {
                        const methods = handler.route.methods;
                        routes.push({
                            path: handler.route.path,
                            methods: Object.keys(methods).map(method => method.toUpperCase())
                        });
                    }
                });
            }
        });

        return res.status(200).json({
            success: true,
            msg: 'All Routes!',
            data: routes
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

const addRouterPermission = async (req,res) => {

    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(200).json({
                success: false,
                msg: 'Errors',
                errors:errors.array()
            });

        }

        const {router_endpoint, role, permission,permission_id } = req.body;
        const routerPermission = await RouterPermission.findOneAndUpdate(
            { router_endpoint, role },
            { router_endpoint, role, permission,permission_id },
            { upsert:true, new:true, setDefaultsOnInsert:true }

        );
        return res.status(200).json({
            success: true,
            msg: 'Router Permission added/updated',
            data: routerPermission,
        })


    } catch (error) {
        return res.status(400).json({
            success: true,
            msg: error.message
        });
    }
};

const getRoutePermission = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }
        const { router_endpoint } = req.body;
        const routerPermissions = await RouterPermission.find({ 
            router_endpoint }).populate('permission_id');
        return res.status(200).json({
            success: true,
            msg: 'Router Permissions retrieved successfully',
            data: routerPermissions
        });

    } catch (error) {
        
        console.error(error); 
        return res.status(500).json({
            success: false,
            msg: 'An error occurred',
            error: error.message
        });
    }
};


module.exports = {
    getAllRoutes,
    addRouterPermission,
    getRoutePermission,
};
