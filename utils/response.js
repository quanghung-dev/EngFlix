const successResponse = (res, statusCode, message, data = null )=> {
    return res.status(statusCode).json({
        message: message,
        data: data
    });
};


module.exports = {
    successResponse
};
