"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grading_controller_1 = require("./grading.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Retrieve scales is allowed for any authenticated user
router.get('/', (0, auth_1.requireAuth)(), grading_controller_1.GradingController.list);
// Admin-only updates
router.post('/', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), (0, validate_1.validate)(grading_controller_1.createGradingScaleSchema), grading_controller_1.GradingController.create);
router.post('/reset', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), grading_controller_1.GradingController.reset);
router.put('/:id', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), (0, validate_1.validate)(grading_controller_1.updateGradingScaleSchema), grading_controller_1.GradingController.update);
router.delete('/:id', (0, auth_1.requireAuth)([client_1.Role.ADMIN]), grading_controller_1.GradingController.delete);
exports.default = router;
