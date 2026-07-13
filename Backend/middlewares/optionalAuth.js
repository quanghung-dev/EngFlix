const verifyToken = require('./auth.js');

const optionalAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return next();
    }

    return verifyToken(req, res, next);
};

module.exports = optionalAuth;
