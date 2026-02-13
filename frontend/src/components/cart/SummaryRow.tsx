import React from 'react';
import './SummaryRow.css';

interface SummaryRowProps {
    label: string;
    value: string | number;
    isDiscount?: boolean;
    isTotal?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, isDiscount, isTotal }) => {
    return (
        <div className={`summary-row ${isTotal ? 'total' : ''}`}>
            <span className="label">{label}</span>
            <span className={`value ${isDiscount ? 'discount' : ''}`}>
                {isDiscount && '-'}${value}
            </span>
        </div>
    );
};

export default SummaryRow;