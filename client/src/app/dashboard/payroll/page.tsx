"use client";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const PageWrapper = styled.div`
    animation: fadeIn 0.5s ease-out;
    padding: 2rem;
`;
const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textHeading};
    margin-bottom: 2rem;
`;
const Section = styled.div`
    background: ${({ theme }) => theme.colors.bgSecondary};
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: ${({ theme }) => theme.shadows.soft};
`;
const FilterBar = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
`;
const ExportButton = styled.button`
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    margin-left: 1rem;
    &:hover { opacity: 0.85; }
`;

const departmentOptions = [
    'All',
    'Finance',
    'HR',
    'Engineering',
    'Sales',
    'Marketing',
    'Operations',
    'IT',
    'Other',
];

function toCSV(rows: any[], columns: string[]) {
    const header = columns.join(',');
    const data = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(',')).join('\n');
    return header + '\n' + data;
}

export default function PayrollPage() {
    const { user } = useAuth();
    const [salarySummary, setSalarySummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [department, setDepartment] = useState('All');

    useEffect(() => {
        setLoading(true);
        api.get('/salaries/summary')
            .then(res => setSalarySummary(res.data))
            .catch(() => setError('Failed to fetch payroll data'))
            .finally(() => setLoading(false));
    }, []);

    const filterByDepartment = (list: any[]) => {
        if (department === 'All') return list;
        return list.filter(emp => emp.department === department);
    };

    const handleExport = (list: any[], type: 'paid' | 'pending') => {
        const columns = type === 'paid'
            ? ['name', 'amount', 'date', 'department']
            : ['name', 'amount', 'due', 'department'];
        const csv = toCSV(list, columns);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'paid' ? 'employees_paid.csv' : 'employees_pending.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <PageWrapper><PageTitle>Payroll</PageTitle><p>Loading...</p></PageWrapper>;
    if (error) return <PageWrapper><PageTitle>Payroll</PageTitle><p style={{ color: 'red' }}>{error}</p></PageWrapper>;

    const employeesPaid = filterByDepartment(salarySummary?.employeesPaid || []);
    const employeesPending = filterByDepartment(salarySummary?.employeesPending || []);

    return (
        <PageWrapper>
            <PageTitle>Payroll</PageTitle>
            <FilterBar>
                <label>Department:
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                        {departmentOptions.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </label>
            </FilterBar>
            <Section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Employees Paid</h2>
                    <ExportButton onClick={() => handleExport(employeesPaid, 'paid')}>Export CSV</ExportButton>
                </div>
                <ul>
                    {employeesPaid.length > 0 ? (
                        employeesPaid.map((emp: any, idx: number) => (
                            <li key={idx}>{emp.name} - {emp.amount} RWF on {emp.date ? new Date(emp.date).toLocaleDateString() : ''} {emp.department ? `(${emp.department})` : ''}</li>
                        ))
                    ) : <li>No employees paid yet.</li>}
                </ul>
            </Section>
            <Section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Employees Pending</h2>
                    <ExportButton onClick={() => handleExport(employeesPending, 'pending')}>Export CSV</ExportButton>
                </div>
                <ul>
                    {employeesPending.length > 0 ? (
                        employeesPending.map((emp: any, idx: number) => (
                            <li key={idx}>{emp.name} - {emp.amount} RWF (Due: {emp.due}) {emp.department ? `(${emp.department})` : ''}</li>
                        ))
                    ) : <li>No pending salaries.</li>}
                </ul>
            </Section>
        </PageWrapper>
    );
} 