import React, { useState } from 'react';
import './FilterPrice.css';

const FilterPrice: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    const minLimit = 9000;
    const maxLimit = 883000;

    const [minPrice, setMinPrice] = useState(minLimit);
    const [maxPrice, setMaxPrice] = useState(maxLimit);

    const minPercent = ((minPrice - minLimit) / (maxLimit - minLimit)) * 100;
    const maxPercent = ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100;

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    // --- Logic xử lý cho Thanh trượt (Slider) ---
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxPrice - 1000);
        setMinPrice(value);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minPrice + 1000);
        setMaxPrice(value);
    };

    // --- Logic xử lý cho Ô nhập liệu (Input Box) ---
    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Loại bỏ dấu chấm và ký tự lạ, chỉ giữ lại số
        const value = Number(e.target.value.replace(/\D/g, ''));

        // Cập nhật giá trị (giới hạn không vượt quá maxPrice và không nhỏ hơn 0)
        if (value >= 0 && value <= maxPrice - 1000) {
            setMinPrice(value);
        } else if (value > maxPrice - 1000) {
            setMinPrice(maxPrice - 1000);
        }
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value.replace(/\D/g, ''));

        // Cập nhật giá trị (không nhỏ hơn minPrice và không vượt quá giới hạn tuyệt đối)
        if (value <= maxLimit && value >= minPrice + 1000) {
            setMaxPrice(value);
        } else if (value > maxLimit) {
            setMaxPrice(maxLimit);
        }
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
                        />
                        <span className="price-separator">-</span>
                        <input
                            type="text"
                            className="price-input-box"
                            value={formatPrice(maxPrice)}
                            onChange={handleMaxInputChange}
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