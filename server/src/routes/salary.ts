import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Salary, SalaryStatus } from '../entity/Salary';
import { User, UserRole } from '../entity/User';
import { protect, authorizeFinancialManager } from '../middleware/authMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

// GET /api/salaries/summary - Dashboard summary for salaries
router.get('/summary', authorizeFinancialManager, async (req: AuthRequest, res) => {
    try {
        const salaryRepo = getRepository(Salary);
        const totalSalaries = await salaryRepo
            .createQueryBuilder('salary')
            .select('SUM(salary.amount)', 'sum')
            .getRawOne();
        const totalNetSalaries = await salaryRepo
            .createQueryBuilder('salary')
            .select('SUM(salary.netAmount)', 'sum')
            .getRawOne();
        const pendingSalaries = await salaryRepo.count({ where: { status: SalaryStatus.PENDING } });
        const paidSalaries = await salaryRepo.count({ where: { status: SalaryStatus.PAID } });
        const totalPaid = await salaryRepo
            .createQueryBuilder('salary')
            .select('SUM(salary.amount)', 'sum')
            .where('salary.status = :status', { status: SalaryStatus.PAID })
            .getRawOne();
        const totalPending = await salaryRepo
            .createQueryBuilder('salary')
            .select('SUM(salary.amount)', 'sum')
            .where('salary.status = :status', { status: SalaryStatus.PENDING })
            .getRawOne();
        const employeesPaid = await salaryRepo.find({ where: { status: SalaryStatus.PAID }, relations: ['employee'] });
        const employeesPending = await salaryRepo.find({ where: { status: SalaryStatus.PENDING }, relations: ['employee'] });
        res.json({
            totalSalaries: parseFloat(totalSalaries.sum) || 0,
            netSalaries: parseFloat(totalNetSalaries.sum) || 0,
            pendingSalaries,
            paidSalaries,
            totalPaid: parseFloat(totalPaid.sum) || 0,
            totalPending: parseFloat(totalPending.sum) || 0,
            employeesPaid: employeesPaid.map(s => ({ name: s.employee.name, amount: s.amount, date: s.paidAt })),
            employeesPending: employeesPending.map(s => ({ name: s.employee.name, amount: s.amount, due: s.period })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/salaries - List all salaries (optionally filter by status, period, employee)
router.get('/', authorizeFinancialManager, async (req, res) => {
    try {
        const { status, period, employeeId } = req.query;
        const salaryRepo = getRepository(Salary);
        const where: any = {};
        if (status) where.status = status;
        if (period) where.period = period;
        if (employeeId) where.employee = employeeId;
        const salaries = await salaryRepo.find({ where, relations: ['employee'] });
        res.json(salaries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/salaries - Create a salary record
router.post('/', authorizeFinancialManager, async (req: AuthRequest, res) => {
    try {
        const { employeeId, amount, netAmount, period } = req.body;
        if (!employeeId || !amount || !period) {
            return res.status(400).json({ message: 'employeeId, amount, and period are required.' });
        }
        const userRepo = getRepository(User);
        const employee = await userRepo.findOne({ where: { id: employeeId } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        const salaryRepo = getRepository(Salary);
        const salary = salaryRepo.create({
            employee,
            amount,
            netAmount: netAmount || amount,
            period,
            status: SalaryStatus.PENDING,
        });
        await salaryRepo.save(salary);
        res.status(201).json(salary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PATCH /api/salaries/:id/pay - Mark a salary as paid
router.patch('/:id/pay', authorizeFinancialManager, async (req, res) => {
    try {
        const salaryRepo = getRepository(Salary);
        const salary = await salaryRepo.findOne({ where: { id: req.params.id }, relations: ['employee'] });
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found.' });
        }
        salary.status = SalaryStatus.PAID;
        salary.paidAt = new Date();
        await salaryRepo.save(salary);
        res.json(salary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router; 