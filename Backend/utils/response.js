const dataResponse = (res, statusCode = 200, data = null, meta = null, error = null) => {
    const response = { data };
    if (error !== null) response.error = error;
    if (meta !== null) response.meta = meta;
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        error: {
            code: statusCode,
            message
        }
    });
};

module.exports = {
    dataResponse,
    errorResponse
};
