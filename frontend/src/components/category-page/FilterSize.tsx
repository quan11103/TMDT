import React, { useState } from 'react';
import './FilterSize.css';

interface SizeOption {
    id: string;
    label: string;
    count: number;
}

const FilterSize: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    // Dữ liệu mẫu dựa trên mã HTML bạn cung cấp
    const sizeOptions: SizeOption[] = [
        { id: '1644', label: '10X9.2Cm', count: 2 },
        { id: '1633', label: '67.5~120X2.3Cm', count: 2 },
        { id: '1564', label: 'A4', count: 19 },
        { id: '1561', label: 'A5', count: 32 },
        { id: '1563', label: 'A6', count: 18 },
        { id: '1562', label: 'A7', count: 5 },
        { id: '1524', label: 'Small', count: 1 },
        { id: '1658', label: 'W30Mm*L7M', count: 1 },
        { id: '1725', label: '0.3mm', count: 2 },
    ];

    return (
        <div className="filter-container">
            {/* Header Accordion */}
            <button
                className={`filter-header ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="filter-title">Phân loại</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="chevron-icon"
                >
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>

            {/* Nội dung có hiệu ứng trượt và thanh cuộn */}
            <div className={`filter-content ${isOpen ? 'show' : ''}`}>
                <div className="scroll-area">
                    <ul className="size-list">
                        {sizeOptions.map((option) => (
                            <li key={option.id} className="size-item">
                                <label className="checkbox-label">
                                    <input type="checkbox" className="custom-checkbox" />
                                    <span className="attribute-name">{option.label}</span>
                                    <span className="attribute-count">({option.count})</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FilterSize;