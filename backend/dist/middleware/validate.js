"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Replace req body/query/params with parsed versions for type safety and defaults
            if (parsed.body) {
                req.body = parsed.body;
            }
            if (parsed.query) {
                Object.keys(req.query).forEach(key => delete req.query[key]);
                Object.assign(req.query, parsed.query);
            }
            if (parsed.params) {
                Object.keys(req.params).forEach(key => delete req.params[key]);
                Object.assign(req.params, parsed.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Respond directly with JSON to avoid Express 5 async error-handler edge cases
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation Error',
                        details: error.issues,
                    },
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
