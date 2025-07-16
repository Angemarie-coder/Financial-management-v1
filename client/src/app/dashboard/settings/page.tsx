"use client";
// ... your settings page code here ...
// Placeholder for Settings page
import styled from 'styled-components';
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
export default function SettingsPage() {
    return (
        <PageWrapper>
            <PageTitle>Settings</PageTitle>
            <p>Settings management coming soon...</p>
        </PageWrapper>
    );
} 