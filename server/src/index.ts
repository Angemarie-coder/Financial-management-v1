// src/index.ts
import "reflect-metadata";
import express from 'express';
import { createConnection } from "typeorm";
import cors from 'cors';
import path from 'path';
import { config } from "./config/config";
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
            url: process.env.DATABASE_URL,
            // These fallbacks are good for local development
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User, Budget, Category, Item, Salary, Transaction],
            synchronize: true,
            logging: false,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        });
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }

    const app = express();

    // --- UPDATED CORS CONFIGURATION ---
    // This now directly uses the FRONTEND_URL from your environment variables.
    // It's cleaner and more secure.
    const allowedOrigins = [
        'http://localhost:3000', // For local development
        process.env.FRONTEND_URL  // For your Vercel deployment
    ];

    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            // or if the origin is in our allowed list.
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.error(`CORS error: Origin ${origin} not allowed.`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));
    // --- END OF UPDATED SECTION ---

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // API Routers
    app.use('/api/users', usersRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/budgets', budgetsRouter);
    app.use('/api/salaries', salaryRouter);
    app.use('/api/transactions', transactionRouter);

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`🚀 Server is listening on port ${port}`);
    });
};

main().catch((error) => {
    console.error("Application failed to start:", error);
    process.exit(1);
});