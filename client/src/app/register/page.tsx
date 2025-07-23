// src/app/register/page.tsx
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import { Card, PageContainer } from '@/components/Styled';
import { theme } from '@/styles/theme';

export default function RegisterPage() {
    return (
        <PageContainer>
            <Card>
                <h2 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>Create an Account</h2>
                <RegisterForm />
                <p style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
                    Already have an account? <Link href="/login" style={{ color: theme.colors.primary, textDecoration: 'none' }}>Log In</Link>
                </p>
            </Card>
        </PageContainer>
    );
}