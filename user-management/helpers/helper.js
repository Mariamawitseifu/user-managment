const { default: mongoose } = require('mongoose');
const prisma = require('../prisma/prismaClient');

const getUserPermissions = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userPermissions: {
                    select: {
                        permissions: true 
                    }
                }
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            role: user.role,
            permissions: user.userPermissions ? user.userPermissions.map(up => up.permissions) : null
        };
        
    } catch (error) {
        throw new Error(error.message);
    }
};

const getRouterPermission = async (role, endpoint) => {
    try {
        const routerPermission = await prisma.routerPermission.findFirst({
            where: {
                router_endpoint: endpoint,
                role
            },
            include: {
                permission_id: true 
            }
        });

        return routerPermission;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getUserPermissions,
    getRouterPermission,
}