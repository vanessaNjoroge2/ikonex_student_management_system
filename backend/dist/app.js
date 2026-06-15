"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const students_routes_1 = __importDefault(require("./modules/students/students.routes"));
const streams_routes_1 = __importDefault(require("./modules/streams/streams.routes"));
const subjects_routes_1 = __importDefault(require("./modules/subjects/subjects.routes"));
const scores_routes_1 = __importDefault(require("./modules/scores/scores.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const accounts_routes_1 = __importDefault(require("./modules/accounts/accounts.routes"));
const grading_routes_1 = __importDefault(require("./modules/grading/grading.routes"));
const app = (0, express_1.default)();
// Security and Logging middleware
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://ikonex-student-management-system.onrender.com',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin rewrites)
        if (!origin) {
            return callback(null, true);
        }
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.onrender.com');
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Mounting API routers
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', students_routes_1.default);
app.use('/api/streams', streams_routes_1.default);
app.use('/api/subjects', subjects_routes_1.default);
app.use('/api/scores', scores_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/accounts', accounts_routes_1.default);
app.use('/api/grading-scales', grading_routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
