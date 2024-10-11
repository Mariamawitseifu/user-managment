let limit = 10;
let page = 1;
let offset = 0;

function getPaginated(data, res){
    return {
        total: data.count,
        data: data.rows,
        page:page,
        data_length:data.rows.length,
    };
}

function getLimit(req){
    limit=parseInt(req.query.limit, 10) || 10;

    return limit;
}

function getOffset(req){
    page = parseInt(req.query.page, 10) || 1;
    offset = (page - 1) * limit || 0;

    return offset;
}


module.exports = {
    getPaginated,
    getLimit,
    getOffset
}
