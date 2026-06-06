"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = void 0;
const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPaginationParams = getPaginationParams;
