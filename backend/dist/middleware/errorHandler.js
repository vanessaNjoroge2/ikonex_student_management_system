"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
        return (0, response_1.sendError)(res, 'Validation Error', 400, 'VALIDATION_ERROR', err.errors || err.issues);
    }
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    return (0, response_1.sendError)(res, message, status, code);
};
exports.errorHandler = errorHandler;
