"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accounts_controller_1 = require("./accounts.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Profile update (any authenticated user)
router.put('/profile', (0, auth_1.requireAuth)(), (0, validate_1.validate)(accounts_controller_1.updateProfileSchema), accounts_controller_1.AccountsController.updateProfile);
// Admin-only endpoints
router.get('/', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), accounts_controller_1.AccountsController.list);
router.post('/', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), (0, validate_1.validate)(accounts_controller_1.createAccountSchema), accounts_controller_1.AccountsController.create);
router.get('/logs', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), accounts_controller_1.AccountsController.getLogs);
router.put('/:id', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), (0, validate_1.validate)(accounts_controller_1.updateAccountSchema), accounts_controller_1.AccountsController.update);
router.put('/:id/reset-password', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), (0, validate_1.validate)(accounts_controller_1.resetPasswordSchema), accounts_controller_1.AccountsController.resetPassword);
router.delete('/:id', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), accounts_controller_1.AccountsController.delete);
exports.default = router;
