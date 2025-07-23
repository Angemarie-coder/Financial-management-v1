// src/app/verify-email/[token]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import { Card, PageContainer, Button } from '@/components/Styled';
import { theme } from '@/styles/theme';

// Define the statuses for clarity
type VerificationStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<VerificationStatus>('verifying');
    const [message, setMessage] = useState('Verifying your email address...');
    
    // The useParams hook reads the dynamic parts of the URL.
    // The name 'token' matches the folder name `[token]`.
    const params = useParams();
    const token = params.token as string;

    // We use useCallback to memoize the verification function
    const verifyToken = useCallback(async () => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing. Please check the link.');
            return;
        }

        try {
            // Make an API call to your backend to verify the token.
            // This assumes your backend has an endpoint like POST /api/auth/verify-email
            await api.post('/auth/verify-email', { token });

            setStatus('success');
            setMessage('Your email has been successfully verified! You can now log in.');
        } catch (err: any) {
            setStatus('error');
            // Display a specific error from the backend if available, otherwise a generic one.
            setMessage(err.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
        }
    }, [token]);

    // The useEffect hook triggers the verification process once the component mounts.
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    // Optional: You can add a spinner component here
                    <p style={{ textAlign: 'center' }}>{message}</p>
                );
            case 'success':
                return (
                    <>
                        <p style={{ color: theme.colors.primary, textAlign: 'center', marginBottom: theme.spacing.lg }}>{message}</p>
                        <Link href="/login" passHref>
                            <Button style={{ width: '100%' }}>Go to Login</Button>
                        </Link>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <p style={{ color: theme.colors.redError, textAlign: 'center' }}>{message}</p>
                    </>
                );
        }
    };

    return (
        <PageContainer>
            <Card>
                <h2 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                    Email Verification
                </h2>
                <div>
                    {renderContent()}
                </div>
            </Card>
        </PageContainer>
    );
}