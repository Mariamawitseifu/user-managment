const prisma = require('../prisma/prismaClient'); 


const getSoftDeleteQuery = (trashed) => {
    return trashed ? {} : { deletedAt: null }; // Adjust according to your schema
};

const withTransaction = async (callback) => {
    return await prisma.$transaction(callback);
};

exports.findMany = async (model, { params = {}, trashed = false, include = null, columns = '*', limit = null, page = null, orderBy = { createdAt: 'desc' } } = {}) => {
    try {
        const whereClause = {
            ...getSoftDeleteQuery(trashed),
            ...params
        };

        const paginationQuery = getPaginationQuery(limit, page);
        const attributesQuery = getAttributesQuery(columns);

        const record = await prisma[model].findMany({
            where: whereClause,
            orderBy: orderBy,
            include: include,
            ...attributesQuery,
            ...paginationQuery,
        });

        return { data: record };
    } catch (error) {
        console.error('Error fetching records:', error);
        throw new Error('Error fetching records');
    }
};

const getAttributesQuery = (columns) => {
    return columns === '*' ? {} : { select: columns.split(',').reduce((acc, column) => ({ ...acc, [column]: true }), {}) };
};

const getPaginationQuery = (limit, page) => {
    const query = {};
    if (limit && page) {
        query.take = limit;
        if (page) {
            const skip = (page - 1) * limit;
            query.skip = skip;
        }
    }
    return query;
};

const getTotalCount = async (model, { trashed = false, params = {} }) => {
    return await prisma[model].count({
        where: { ...getSoftDeleteQuery(trashed), ...params }
    });
};

exports.findUnique = async (model, params, { trashed = false, columns = '*', include = null } = {}) => {
    try {
        const record = await prisma[model].findUnique({
            where: { ...params, ...getSoftDeleteQuery(trashed) },
            ...(include ? { include } : {}),
            ...getAttributesQuery(columns),
        });

        main();

        return { data: record };
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};


exports.findFirst = async (model, { where, orderBy = { createdAt: 'desc' }, include = null } = {}) => {
    try {
        const record = await prisma[model].findFirst({
            where,
            orderBy,
            ...(include ? { include } : {})
        });
        return { data: record };
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching first record');
    }
};

exports.create = async (model, data) => {
    try {
        const record = await prisma[model].create({
            data 
        });
        return { data: record };
    } catch (error) {
        console.error(error);
        throw new Error('Error creating record');
    }
};

exports.update = async (model, where, data) => {
    try {
        const record = await prisma[model].update({
            where,
            data,
        });
        return { data: record };
    } catch (error) {
        console.error(error);
        throw new Error('Error updating record');
    }
};

exports.delete = async (model, where) => {
    try {
        const record = await prisma[model].delete({
            where,
        });
        return { data: record };
    } catch (error) {
        console.error(error);
        throw new Error('Error deleting record');
    }
};

exports.softDelete = async (model, where) => {
    try {
        const record = await prisma[model].update({
            where,
            data: { deletedAt: new Date() }, // Assuming soft delete sets a deletedAt timestamp
        });
        return { data: record };
    } catch (error) {
        console.error(error);
        throw new Error('Error soft deleting record');
    }
};


module.exports = {
    getSoftDeleteQuery,
    getTotalCount,
};