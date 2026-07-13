const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    console.error(`[Error] ${statusCode} - ${message}`);
    if (err.stack) console.error(err.stack);
    res.status(statusCode).json({
        error: {
            code: statusCode,
            message
        }
    }); 
};

module.exports = { errorHandler };
