"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
