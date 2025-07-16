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
const ChartContainer = styled.div`
    background: ${({ theme }) => theme.colors.bgSecondary};
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: ${({ theme }) => theme.shadows.soft};
`;

export default function ReportsPage() {
    // Placeholder/mock data
    return (
        <PageWrapper>
            <PageTitle>Reports & Charts</PageTitle>
            <ChartContainer>
                <h2>Salary Trends (Mock Chart)</h2>
                <div style={{height: 200, background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Chart Placeholder</div>
            </ChartContainer>
            <ChartContainer>
                <h2>Expense vs. Budget (Mock Chart)</h2>
                <div style={{height: 200, background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Chart Placeholder</div>
            </ChartContainer>
        </PageWrapper>
    );
} 