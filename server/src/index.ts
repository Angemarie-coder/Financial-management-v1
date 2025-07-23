import "reflect-metadata";
import express from 'express';
import { createConnection } from "typeorm";
import cors from 'cors';
import path from 'path';
import { config } from "./config/config"; // Ensure this file exists and exports a port
import { User } from "./entity/User";
import { Budget } from "./entity/Budget";
import { Category } from "./entity/Category";
import { Item } from "./entity/Item";
import { Salary } from "./entity/Salary";
import { Transaction } from "./entity/Transaction";
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import budgetsRouter from './routes/budget';
import salaryRouter from './routes/salary';
import transactionRouter from './routes/transaction';

const main = async () => {
    try {
        await createConnection({
            type: "postgres",
            url: process.env.DATABASE_URL, // Prefer DATABASE_URL for Render
            host: process.env.DB_HOST,     // Fallback for local/dev
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User, Budget, Category, Item, Salary, Transaction],
            synchronize: true, // Caution: Only use in development; disable in production
            logging: false,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        });
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1); // Exit on failure to prevent partial startup
    }

    const app = express();

    // 1. CORS: Handle preflight requests and allow credentials
    app.use(cors({
        origin: 'https://financialmanagementv1.vercel.app', // Exact deployed frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Include OPTIONS
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // Enable if using Authorization headers or cookies
        optionsSuccessStatus: 200 // Ensure preflight returns 200
    }));

    // 2. Body Parsers: Parse JSON and URL-encoded data
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static Files: Serve uploaded files
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // 4. API Routers
    app.use('/api/users', usersRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/budgets', budgetsRouter);
    app.use('/api/salaries', salaryRouter);
    app.use('/api/transactions', transactionRouter);

    // 5. Dynamic Port for Render
    const port = process.env.PORT || (config.port as number) || 5000; // Use Render's PORT or fallback
    app.listen(port, () => {
        console.log(`🚀 Server is listening on http://localhost:${port}`);
    });
};

main().catch((error) => {
    console.error("Application failed to start:", error);
    process.exit(1);
});