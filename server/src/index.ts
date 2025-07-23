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
        process.exit(1);
    }

    const app = express();

    // 1. CORS: Dynamic origin check for Vercel preview URLs
    app.use(cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'https://financialmanagementv1.vercel.app',
                'https://financialmanagementv1-*.vercel.app'
            ];
            if (!origin || allowedOrigins.some(allowed => origin.match(allowed.replace('*', '.*')))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200
    }));

    // 2. Body Parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Static Files
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // 4. API Routers
    app.use('/api/users', usersRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/budgets', budgetsRouter);
    app.use('/api/salaries', salaryRouter);
    app.use('/api/transactions', transactionRouter);

    // 5. Dynamic Port
    const port = process.env.PORT || (config.port as number) || 5000;
    app.listen(port, () => {
        console.log(`🚀 Server is listening on http://localhost:${port}`);
    });
};

main().catch((error) => {
    console.error("Application failed to start:", error);
    process.exit(1);
});