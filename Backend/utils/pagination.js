const getPagination = (query, defaultLimit = 10) => {
    const page = Math.abs(parseInt(query.page)) || 1;
    const limit = Math.abs(parseInt(query.limit)) || defaultLimit;
    const offset = (page - 1) * limit; 
    return {page, limit, offset };
}

const formatPaginatedResponse = (data, totalRows, page, limit) => {
    const totalPages = Math.ceil(totalRows / limit);
    return {
        items: data,
        meta:{
            totalRows: parseInt(totalRows),
            totalPages: totalPages,
            currentPage: page,
            pageSize: limit
        }
    };
};

const buildPaginationMeta = (page, limit, total) => {
    return {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
    };
};

module.exports = {
    getPagination,
    formatPaginatedResponse,
    buildPaginationMeta
};
