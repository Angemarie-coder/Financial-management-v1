import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../entity/Transaction';
import { User, UserRole } from '../entity/User';
import { protect, authorizeFinancialManager } from '../middleware/authMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

// GET /api/transactions - List all transactions (optionally filter by status/type)
router.get('/', authorizeFinancialManager, async (req, res) => {
    try {
        const { status, type } = req.query;
        const transactionRepo = getRepository(Transaction);
        const where: any = {};
        if (status) where.status = status;
        if (type) where.type = type;
        const transactions = await transactionRepo.find({ where, relations: ['createdBy', 'approvedBy'], order: { createdAt: 'DESC' } });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/transactions - Create a new transaction
router.post('/', authorizeFinancialManager, async (req: AuthRequest, res) => {
    try {
        const { description, amount, type } = req.body;
        if (!description || !amount || !type) {
            return res.status(400).json({ message: 'description, amount, and type are required.' });
        }
        const userRepo = getRepository(User);
        const createdBy = await userRepo.findOne({ where: { id: req.user?.id } });
        if (!createdBy) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const transactionRepo = getRepository(Transaction);
        const transaction = transactionRepo.create({
            description,
            amount,
            type,
            status: TransactionStatus.PENDING,
            createdBy,
        });
        await transactionRepo.save(transaction);
        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PATCH /api/transactions/:id/approve - Approve a transaction
router.patch('/:id/approve', authorizeFinancialManager, async (req: AuthRequest, res) => {
    try {
        const transactionRepo = getRepository(Transaction);
        const transaction = await transactionRepo.findOne({ where: { id: req.params.id }, relations: ['approvedBy'] });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        if (transaction.status !== TransactionStatus.PENDING) {
            return res.status(400).json({ message: 'Only pending transactions can be approved.' });
        }
        const userRepo = getRepository(User);
        const approver = await userRepo.findOne({ where: { id: req.user?.id } });
        transaction.status = TransactionStatus.APPROVED;
        transaction.approvedBy = approver!;
        transaction.approvedAt = new Date();
        await transactionRepo.save(transaction);
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PATCH /api/transactions/:id/reject - Reject a transaction
router.patch('/:id/reject', authorizeFinancialManager, async (req: AuthRequest, res) => {
    try {
        const transactionRepo = getRepository(Transaction);
        const transaction = await transactionRepo.findOne({ where: { id: req.params.id }, relations: ['approvedBy'] });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }
        if (transaction.status !== TransactionStatus.PENDING) {
            return res.status(400).json({ message: 'Only pending transactions can be rejected.' });
        }
        const userRepo = getRepository(User);
        const approver = await userRepo.findOne({ where: { id: req.user?.id } });
        transaction.status = TransactionStatus.REJECTED;
        transaction.approvedBy = approver!;
        transaction.approvedAt = new Date();
        await transactionRepo.save(transaction);
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router; 