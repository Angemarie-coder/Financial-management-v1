// src/index.ts
import "reflect-metadata";
import express from 'express';
import { createConnection } from "typeorm";
import cors from 'cors';
import path from 'path'; // Import the path module
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
            database: "fmp",
            entities: [User, Budget, Category, Item, Salary, Transaction],
            synchronize: true,
            logging: false,
        });
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return;
    }

    const app = express();

    // --- MIDDLEWARE ORDER IS CRITICAL ---

    // 1. CORS: Must come first to handle preflight requests.
    app.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    
    // 2. Body Parsers: To parse JSON and URL-encoded data.
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static Files: Serve uploaded files.
    // This tells Express that the '/public' URL path should map to the 'public' directory on the server.
    app.use('/public', express.static(path.join(__dirname, '../public')));


    // 4. API Routers: These handle the application's logic.
    app.use('/api/users', usersRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/budgets', budgetsRouter);
    app.use('/api/salaries', salaryRouter);
    app.use('/api/transactions', transactionRouter);

    app.listen(config.port, () => {
        console.log(`🚀 Server is listening on http://localhost:${config.port}`);
    });
};

main();