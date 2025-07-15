// src/app/change-password.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, Label, InputGroup, FormWrapper, Card, PageContainer } from '@/components/Styled';
import { theme } from '@/styles/theme';
import { useEffect } from 'react';
import api from '@/services/api';

export default function ChangePasswordPage() {
    const { mustChangePassword, clearMustChangePassword, token, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!mustChangePassword) {
            router.replace('/dashboard');
        }
    }, [mustChangePassword, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Password changed successfully. Redirecting...');
            clearMustChangePassword();
            setTimeout(() => router.replace('/dashboard'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mustChangePassword) return null;

    return (
        <PageContainer>
            <Card>
                <h2 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>Change Your Password</h2>
                <form onSubmit={handleSubmit}>
                    <FormWrapper>
                        <InputGroup>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                        </InputGroup>
                        {error && <p style={{ color: theme.colors.redError }}>{error}</p>}
                        {success && <p style={{ color: theme.colors.primary }}>{success}</p>}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button type="button" style={{ marginTop: theme.spacing.sm, background: theme.colors.redError, color: 'white' }} onClick={logout}>
                            Logout
                        </Button>
                    </FormWrapper>
                </form>
            </Card>
        </PageContainer>
    );
} 