import React, { useState } from 'react';
import './FilterPrice.css';

interface Props {
    minPrice: number;
    maxPrice: number;
    onFilterPrice: (min: number, max: number) => void;
}

const FilterPrice: React.FC<Props> = ({ minPrice, maxPrice, onFilterPrice }) => {
    const [isOpen, setIsOpen] = useState(true);
    const minLimit = 0;
    const maxLimit = 1000000;

    const minPercent = ((minPrice - minLimit) / (maxLimit - minLimit)) * 100;
    const maxPercent = ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100;

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    // --- Logic xử lý cho Thanh trượt (Slider) ---
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), maxPrice - 1000);
        onFilterPrice(val, maxPrice);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), minPrice + 1000);
        onFilterPrice(minPrice, val);
    };

    // --- Logic xử lý khi đang gõ (Chỉ cho phép nhập số) ---
    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value.replace(/\D/g, ''));
        // Cập nhật tạm thời để người dùng thấy con số mình đang gõ
        onFilterPrice(value, maxPrice);
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value.replace(/\D/g, ''));
        onFilterPrice(minPrice, value);
    };

    // --- Logic tự động điều chỉnh khi rời khỏi ô nhập (Validation) ---
    const handleMinBlur = () => {
        let validatedMin = minPrice;

        if (minPrice < minLimit) validatedMin = minLimit;
        if (minPrice > maxPrice - 1000) validatedMin = maxPrice - 1000;

        onFilterPrice(validatedMin, maxPrice);
    };

    const handleMaxBlur = () => {
        let validatedMax = maxPrice;

        if (maxPrice > maxLimit) validatedMax = maxLimit;
        if (maxPrice < minPrice + 1000) validatedMax = minPrice + 1000;

        onFilterPrice(minPrice, validatedMax);
    };

    return (
        <div className="filter-container">
            <button
                className={`filter-header ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="price-header-title">
                    <span className="font-bold">Giá</span>
                    <span className="currency-unit">(VND)</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>

            <div className={`filter-content ${isOpen ? 'show' : ''}`}>
                <div className="price-wrapper">

                    {/* Ô nhập giá: Đã gỡ bỏ readOnly và thêm onChange */}
                    <div className="price-inputs">
                        <input
                            type="text"
                            className="price-input-box"
                            value={formatPrice(minPrice)}
                            onChange={handleMinInputChange}
                            onBlur={handleMinBlur}
                        />
                        <span className="price-separator">-</span>
                        <input
                            type="text"
                            className="price-input-box"
                            value={formatPrice(maxPrice)}
                            onChange={handleMaxInputChange}
                            onBlur={handleMaxBlur}
                        />
                    </div>

                    {/* Thanh trượt kép: Tự động cập nhật nhờ vào State dùng chung */}
                    <div className="slider-container">
                        <div className="slider-track"></div>
                        <div
                            className="slider-range"
                            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                        ></div>

                        <input
                            type="range"
                            min={minLimit}
                            max={maxLimit}
                            value={minPrice}
                            onChange={handleMinChange}
                            className="thumb thumb-left"
                        />
                        <input
                            type="range"
                            min={minLimit}
                            max={maxLimit}
                            value={maxPrice}
                            onChange={handleMaxChange}
                            className="thumb thumb-right"
                        />
                    </div>

                    <div className="price-labels">
                        <span>{formatPrice(minLimit)}</span>
                        <span>{formatPrice(maxLimit)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPrice;