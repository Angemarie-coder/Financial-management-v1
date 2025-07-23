// src/app/login/page.tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/app/login/LoginForm';
import { Card, PageContainer } from '@/components/Styled';
import { theme } from '@/styles/theme';

export default function LoginPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Effect to redirect if the user is already logged in
    useEffect(() => {
        if (user) {
            router.replace('/dashboard');
        }
    }, [user, router]);
    
    // Render nothing while redirecting
    if (user) {
        return null; 
    }

    return (
        <PageContainer>
            <Card>
                <h2 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
                    Login to Your Account
                </h2>
                
                <LoginForm />

                <p style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>
                        Sign Up
                    </Link>
                </p>
            </Card>
        </PageContainer>
    );
}