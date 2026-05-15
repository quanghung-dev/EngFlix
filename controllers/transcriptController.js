const { successResponse } = require('../utils/response');
const transciptService = require('../services/transcriptServices.js');
const { AppError } = require('../utils/AppError');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

