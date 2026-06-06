"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
const requireAuth = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Authorization token required', 401, 'UNAUTHORIZED');
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, env_1.env.jwtSecret);
            req.user = decoded;
            if (roles && roles.length > 0 && !roles.includes(decoded.role)) {
                return (0, response_1.sendError)(res, 'Access forbidden: insufficient permissions', 403, 'FORBIDDEN');
            }
            next();
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired authorization token', 401, 'UNAUTHORIZED');
        }
    };
};
exports.requireAuth = requireAuth;
