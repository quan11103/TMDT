import React from 'react';
import './QuantitySelector.css';

interface QuantitySelectorProps {
    quantity: number | '';
    onIncrease: () => void;
    onDecrease: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    onChange,
    onBlur
}) => {
    return (
        <div className="qty-box">
            {/* Nút Giảm */}
            <button
                type="button"
                className="qty-btn"
                onClick={onDecrease}
                disabled={quantity !== '' && quantity <= 1}
            >
                −
            </button>

            {/* Ô nhập liệu */}
            <input
                type="number"
                className="qty-input"
                value={quantity}
                onChange={onChange}
                onBlur={onBlur}
            />

            {/* Nút Tăng */}
            <button
                type="button"
                className="qty-btn"
                onClick={onIncrease}
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;