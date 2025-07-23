// src/components/RegisterForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Input, Button, Label, InputGroup, FormWrapper } from '@/components/Styled';
import { theme } from '@/styles/theme';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/auth/register', {
                name,
                email,
                password,
            });
            setSuccess('Registration successful! Please log in.');
            setTimeout(() => {
                router.push('/login');
            }, 2000); // Redirect to login page after 2 seconds
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormWrapper>
                <InputGroup>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </InputGroup>

                {error && <p style={{ color: theme.colors.redError, textAlign: 'center' }}>{error}</p>}
                {success && <p style={{ color: theme.colors.primary, textAlign: 'center' }}>{success}</p>}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
            </FormWrapper>
        </form>
    );
}