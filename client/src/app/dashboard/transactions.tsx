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
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    th, td {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        text-align: left;
    }
    th {
        background: ${({ theme }) => theme.colors.bgSecondary};
        color: ${({ theme }) => theme.colors.textMuted};
        font-size: 1rem;
        font-weight: 600;
    }
`;
const ActionButton = styled.button`
    background: ${({ color, theme }) => color || theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    &:hover { opacity: 0.85; }
`;
const FilterBar = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
`;
const Form = styled.form`
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 2rem;
    background: ${({ theme }) => theme.colors.bgSecondary};
    padding: 1rem;
    border-radius: 8px;
`;

export default function TransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [form, setForm] = useState({ description: '', amount: '', type: 'expense' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/transactions';
            const params = [];
            if (statusFilter) params.push(`status=${statusFilter}`);
            if (typeFilter) params.push(`type=${typeFilter}`);
            if (params.length) url += '?' + params.join('&');
            const res = await api.get(url);
            setTransactions(res.data);
        } catch (err: any) {
            setError('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, [statusFilter, typeFilter]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.patch(`/transactions/${id}/approve`);
            await fetchTransactions();
        } catch {
            alert('Failed to approve transaction');
        } finally {
            setActionLoading(null);
        }
    };
    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await api.patch(`/transactions/${id}/reject`);
            await fetchTransactions();
        } catch {
            alert('Failed to reject transaction');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            await api.post('/transactions', {
                description: form.description,
                amount: parseFloat(form.amount),
                type: form.type,
            });
            setFormSuccess('Transaction created!');
            setForm({ description: '', amount: '', type: 'expense' });
            await fetchTransactions();
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to create transaction');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) return <PageWrapper><PageTitle>Transactions</PageTitle><p>Loading...</p></PageWrapper>;
    if (error) return <PageWrapper><PageTitle>Transactions</PageTitle><p style={{ color: 'red' }}>{error}</p></PageWrapper>;

    return (
        <PageWrapper>
            <PageTitle>Transactions</PageTitle>
            <Form onSubmit={handleFormSubmit}>
                <div>
                    <label>Description<br />
                        <input name="description" value={form.description} onChange={handleFormChange} required style={{ width: 200 }} />
                    </label>
                </div>
                <div>
                    <label>Amount<br />
                        <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleFormChange} required style={{ width: 120 }} />
                    </label>
                </div>
                <div>
                    <label>Type<br />
                        <select name="type" value={form.type} onChange={handleFormChange} required>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </label>
                </div>
                <ActionButton type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Add Transaction'}</ActionButton>
                {formError && <div style={{ color: 'red' }}>{formError}</div>}
                {formSuccess && <div style={{ color: 'green' }}>{formSuccess}</div>}
            </Form>
            <FilterBar>
                <label>Status:
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>
                <label>Type:
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </label>
            </FilterBar>
            <Table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Created At</th>
                        <th>Approved By</th>
                        <th>Approved At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.description}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.type}</td>
                            <td>{tx.status}</td>
                            <td>{tx.createdBy?.name || '-'}</td>
                            <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</td>
                            <td>{tx.approvedBy?.name || '-'}</td>
                            <td>{tx.approvedAt ? new Date(tx.approvedAt).toLocaleString() : '-'}</td>
                            <td>
                                {tx.status === 'pending' && (
                                    <>
                                        <ActionButton onClick={() => handleApprove(tx.id)} disabled={actionLoading === tx.id} color="#34D399">Approve</ActionButton>
                                        <ActionButton onClick={() => handleReject(tx.id)} disabled={actionLoading === tx.id} color="#EF4444">Reject</ActionButton>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </PageWrapper>
    );
} 