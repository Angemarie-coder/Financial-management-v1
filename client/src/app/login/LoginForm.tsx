// src/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, Label, InputGroup, FormWrapper } from '@/components/Styled';
import { theme } from '@/styles/theme';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            // On successful login, the AuthContext should handle the redirect
            // or you can explicitly push here. The useAuth hook is often
            // set up to redirect automatically.
            router.replace('/dashboard'); // Redirect to dashboard after login
        } catch (err: any) {
            // Display error message from the API response or a generic one
            setError(err.response?.data?.message || 'Invalid email or password.');
            setIsSubmitting(false);
        }
        // No need for a `finally` block if you only set isSubmitting to false on error,
        // as a successful login will navigate the user away from the page.
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormWrapper>
                <InputGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        autoComplete="email"
                    />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        autoComplete="current-password"
                    />
                </InputGroup>

                {error && <p style={{ color: theme.colors.redError, textAlign: 'center' }}>{error}</p>}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
            </FormWrapper>
        </form>
    );
}