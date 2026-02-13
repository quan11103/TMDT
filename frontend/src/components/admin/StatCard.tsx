// StatCard.tsx
import React from 'react';
import './StatCard.css';

interface StatProps {
    label: string;
    value: string;
    trend: string;
    isPositive?: boolean;
}

const StatCard: React.FC<StatProps> = ({ label, value, trend, isPositive }) => {
    return (
        <div className="stat-card">
            <h3>{label}</h3>
            <p className="stat-value">{value}</p>
            <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
                {trend}
            </span>
        </div>
    );
};

export default StatCard;