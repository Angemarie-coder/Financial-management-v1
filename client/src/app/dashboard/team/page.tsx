"use client";
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
export default function TeamPage() {
    return (
        <PageWrapper>
            <PageTitle>Team</PageTitle>
            <p>Team management coming soon...</p>
        </PageWrapper>
    );
} 