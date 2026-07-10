const getPagination = (query, defaultLimit = null) => {
    const page = Math.abs(parseInt(query.page)) || 1;
    
    if (query.limit === undefined || query.limit === null || query.limit === '') {
        if (defaultLimit !== null) {
            return { page, limit: defaultLimit, offset: (page - 1) * defaultLimit };
        }
        return { page, limit: null, offset: 0 };
    }
    
    const limit = Math.abs(parseInt(query.limit));
    const offset = (page - 1) * limit; 
    return { page, limit, offset };
}


const buildPaginationMeta = (page, limit, total) => {
    return {
        page,
        limit: limit === null ? total : limit,
        total,
        total_pages: limit === null ? 1 : Math.ceil(total / limit)
    };
};

module.exports = {
    getPagination,
    buildPaginationMeta
};
