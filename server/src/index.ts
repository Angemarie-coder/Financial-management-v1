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
        return;
    }

    const app = express();

    // 1. CORS: Must come first to handle preflight requests.
    app.use(cors({
        origin: [
            'http://localhost:3000',
            'https://financialmanagementtv1.vercel.app', // Matches deployed URL
            'https://financialmanagementv1-40c0enx3m-angemarie-coders-projects.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true // Allow credentials if needed
    }));
    
    // 2. Body Parsers: To parse JSON and URL-encoded data.
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static Files: Serve uploaded files.
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // 4. API Routers: These handle the application's logic.
    app.use('/api/users', usersRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/budgets', budgetsRouter);
    app.use('/api/salaries', salaryRouter);
    app.use('/api/transactions', transactionRouter);

    const port = process.env.PORT || config.port || 5000; // Dynamic port for Render
    app.listen(port, () => {
        console.log(`🚀 Server is listening on http://localhost:${port}`);
    });
};

main();