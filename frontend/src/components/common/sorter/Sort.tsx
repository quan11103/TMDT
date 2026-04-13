import React, { useState, useRef, useEffect } from 'react';
import './Sort.css';

interface SortOption {
    label: string;
    value: string;
}

const Sort: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('Phù hợp nhất');
    const sortRef = useRef<HTMLDivElement>(null);

    // Danh sách 3 mục theo yêu cầu của bạn
    const options: SortOption[] = [
        { label: 'Phù hợp nhất', value: 'default' },
        { label: 'Giá từ cao tới thấp', value: 'price_desc' },
        { label: 'Giá từ thấp tới cao', value: 'price_asc' },
    ];

    // Xử lý đóng menu khi nhấn ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SortOption) => {
        setSelectedLabel(option.label);
        setIsOpen(false);
        // Bạn có thể gọi hàm lọc dữ liệu ở đây, ví dụ: onSortChange(option.value)
    };

    return (
        <div className="sort-container" ref={sortRef}>
            <button
                type="button"
                className={`sort-button ${isOpen ? 'is-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="label-wrapper">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon-main"
                    >
                        <path d="m3 16 4 4 4-4" />
                        <path d="M7 20V4" />
                        <path d="M11 4h10" />
                        <path d="M11 8h7" />
                        <path d="M11 12h4" />
                    </svg>
                    <span className="text-prefix">Sắp xếp theo:</span>
                </div>

                <span className="current-value">{selectedLabel}</span>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon-chevron"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {/* Menu thả xuống */}
            {isOpen && (
                <ul className="sort-dropdown" role="listbox">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            className={`sort-item ${selectedLabel === option.label ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option)}
                            role="option"
                            aria-selected={selectedLabel === option.label}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Sort;