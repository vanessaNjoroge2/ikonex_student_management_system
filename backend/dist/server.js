"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
async function startServer() {
    try {
        // Verify database connection
        console.log('Connecting to PostgreSQL database via Prisma...');
        await db_1.prisma.$connect();
        console.log('Database connection established successfully.');
        const port = env_1.env.port;
        app_1.default.listen(port, () => {
            console.log(`🚀 Ikonex Student Management API is running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
