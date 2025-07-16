// src/app/dashboard/page.tsx
'use client';
import { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import StatCard from '@/components/dashboard/StatCard';
import BudgetStatusChart from '@/app/dashboard/BudgetStatusChart';

const PageWrapper = styled.div`
    animation: fadeIn 0.5s ease-out;
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
const PageHeader = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const PageTitle = styled.h1`
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textHeading};
`;
const WelcomeMessage = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-top: ${({ theme }) => theme.spacing.xs};
`;
const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
`;
const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
    margin-top: ${({ theme }) => theme.spacing.xl};
    align-items: flex-start;
`;

const AdminProgramManagerDashboard = ({ summary, chartData }: any) => (
    <>
        <Grid>
            <StatCard title="Total Approved Budget" value={new Intl.NumberFormat().format(summary.totalApprovedAmount) + ' RWF'} />
            <StatCard title="Pending Approval" value={summary.statusCounts.pending_approval || 0} />
            <StatCard title="Rejected Budgets" value={summary.statusCounts.rejected || 0} />
        </Grid>
        <ChartGrid>
            <BudgetStatusChart data={chartData} />
            <StatCard title="Total Budgets Tracked" value={summary.totalBudgets} subtext="Across all statuses" />
        </ChartGrid>
    </>
);

const FinanceManagerViewerDashboard = ({ summary, salarySummary }: any) => (
    <>
        <Grid>
            <StatCard title="Total Approved Budget" value={new Intl.NumberFormat().format(summary.totalApprovedAmount) + ' RWF'} />
            <StatCard title="Pending Budgets" value={summary.statusCounts.pending_approval || 0} />
            <StatCard title="Total Budgets" value={summary.totalBudgets} />
            <StatCard title="Total Salaries" value={salarySummary ? salarySummary.totalSalaries + ' RWF' : '...'} />
            <StatCard title="Pending Salaries" value={salarySummary ? salarySummary.totalPending + ' RWF' : '...'} />
            <StatCard title="Net Salaries Paid" value={salarySummary ? salarySummary.netSalaries + ' RWF' : '...'} />
            <StatCard title="Total Amount Paid" value={salarySummary ? salarySummary.totalPaid + ' RWF' : '...'} />
            <StatCard title="Total Pending Salaries" value={salarySummary ? salarySummary.totalPending + ' RWF' : '...'} />
        </Grid>
        {salarySummary && (
            <div style={{ marginTop: 32 }}>
                <h3>Employees Paid</h3>
                <ul>
                    {salarySummary.employeesPaid.map((emp: any, idx: number) => (
                        <li key={idx}>{emp.name} - {emp.amount} RWF on {emp.date ? new Date(emp.date).toLocaleDateString() : ''}</li>
                    ))}
                </ul>
                <h3>Employees Pending</h3>
                <ul>
                    {salarySummary.employeesPending.map((emp: any, idx: number) => (
                        <li key={idx}>{emp.name} - {emp.amount} RWF (Due: {emp.due})</li>
                    ))}
                </ul>
            </div>
        )}
    </>
);

const AlertsNotifications = ({ salarySummary, transactions }: any) => {
    const pendingSalaries = salarySummary?.pendingSalaries || 0;
    const pendingTransactions = transactions?.filter((t: any) => t.status === 'pending').length || 0;
    return (
        <div style={{ background: '#2d2d2d', color: '#fff', borderRadius: 8, padding: 16, margin: '24px 0' }}>
            <h3>Alerts & Notifications</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                <li>{pendingSalaries} pending salaries to be paid</li>
                <li>{pendingTransactions} pending transactions to approve</li>
            </ul>
        </div>
    );
};

const RecentTransactions = ({ transactions }: any) => (
    <div style={{ background: '#232323', color: '#fff', borderRadius: 8, padding: 16, margin: '24px 0' }}>
        <h3>Recent Transactions</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {transactions && transactions.slice(0, 5).map((tx: any) => (
                <li key={tx.id}>
                    <b>{tx.description}</b> - {tx.amount} ({tx.type}) [{tx.status}]
                </li>
            ))}
            {(!transactions || transactions.length === 0) && <li>No recent transactions.</li>}
        </ul>
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [salarySummary, setSalarySummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [salaryLoading, setSalaryLoading] = useState(true);
    const [salaryError, setSalaryError] = useState<string | null>(null);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    useEffect(() => {
        api.get('/budgets/summary')
           .then(res => setSummary(res.data))
           .catch(err => console.error("Failed to fetch summary", err))
           .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user?.role === 'finance_manager' || user?.role === 'admin') {
            setSalaryLoading(true);
            api.get('/salaries/summary')
                .then(res => setSalarySummary(res.data))
                .catch(err => {
                    setSalaryError('Failed to fetch salary summary');
                    setSalarySummary(null);
                })
                .finally(() => setSalaryLoading(false));
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === 'finance_manager' || user?.role === 'admin') {
            setTransactionsLoading(true);
            api.get('/transactions')
                .then(res => setTransactions(res.data))
                .catch(() => setTransactions([]))
                .finally(() => setTransactionsLoading(false));
        }
    }, [user]);

    const chartData = useMemo(() => {
        if (!summary?.statusCounts) return [];
        return Object.entries(summary.statusCounts).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value: value as number,
        }));
    }, [summary]);

    const renderDashboard = () => {
        if (loading || !summary) return <p>Loading dashboard data...</p>;
        if ((user?.role === 'finance_manager' || user?.role === 'admin') && salaryLoading) return <p>Loading salary data...</p>;
        if ((user?.role === 'finance_manager' || user?.role === 'admin') && salaryError) return <p style={{ color: 'red' }}>{salaryError}</p>;
        switch(user?.role) {
            case 'admin':
            case 'program_manager': return <AdminProgramManagerDashboard summary={summary} chartData={chartData} />;
            case 'finance_manager':
            case 'viewer':
                return <>
                    <FinanceManagerViewerDashboard summary={summary} salarySummary={salarySummary} />
                    <AlertsNotifications salarySummary={salarySummary} transactions={transactions} />
                    <RecentTransactions transactions={transactions} />
                </>;
            default: return <WelcomeMessage>Welcome! Your dashboard is ready.</WelcomeMessage>;
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageTitle>Overview</PageTitle>
                <WelcomeMessage>Welcome back, {user?.name}. Here's the latest financial summary.</WelcomeMessage>
            </PageHeader>
            {renderDashboard()}
        </PageWrapper>
    );
}