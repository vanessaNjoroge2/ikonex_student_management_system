"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const response_1 = require("../../utils/response");
class DashboardController {
    static async getStats(req, res, next) {
        try {
            const stats = await dashboard_service_1.DashboardService.getStats(req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    static async getActivity(req, res, next) {
        try {
            const activities = await dashboard_service_1.DashboardService.getActivity(req.user.id, req.user.role === 'ADMIN');
            return (0, response_1.sendSuccess)(res, activities);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
