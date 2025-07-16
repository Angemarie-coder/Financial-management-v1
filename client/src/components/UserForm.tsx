// src/components/UserForm.tsx
'use client';
import { useState, useEffect, FormEvent } from 'react';
import styled from 'styled-components';
import { Input, Button } from './Styled'; // Reusing our styled components
import { theme } from '@/styles/theme';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Select = styled.select`
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.bgPrimary};
    color: ${({ theme }) => theme.colors.textHeading};
    font-size: ${({ theme }) => theme.fontSizes.md};
    transition: ${({ theme }) => theme.transitions.main};
    &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.borderFocus};
        box-shadow: ${({ theme }) => theme.shadows.soft};
    }
`;

export interface UserFormData {
    name: string;
    email: string;
    role: 'admin' | 'program_manager' | 'finance_manager';
    department?: string;
}

interface UserFormProps {
    onSubmit: (data: UserFormData) => void | Promise<void>;
    isSubmitting: boolean;
    initialData?: UserFormData;
    departmentOptions?: string[];
}

export default function UserForm({ onSubmit, isSubmitting, initialData, departmentOptions }: UserFormProps) {
    const [form, setForm] = useState<UserFormData>(initialData || {
        name: '',
        email: '',
        role: 'finance_manager',
        department: departmentOptions && departmentOptions.length > 1 ? departmentOptions[1] : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label>
                Name:
                <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
                Email:
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
                Role:
                <select name="role" value={form.role} onChange={handleChange} required>
                    <option value="admin">Admin</option>
                    <option value="program_manager">Program Manager</option>
                    <option value="finance_manager">Finance Manager</option>
                </select>
            </label>
            {departmentOptions && (
                <label>
                    Department:
                    <select name="department" value={form.department || ''} onChange={handleChange} required>
                        {departmentOptions.filter(dep => dep !== 'All').map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </label>
            )}
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
        </form>
    );
}