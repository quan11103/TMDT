import React from 'react';
import './QuantitySelector.css';

interface QuantitySelectorProps {
    quantity: number;
    onChange: (value: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onChange }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);

        // Nếu người dùng xóa hết -> coi như 1
        if (isNaN(value) || value < 1) {
            onChange(1);
        } else {
            onChange(value);
        }
    };

    const adjustment = (step: number) => {
        const nextValue = Math.max(1, quantity + step);
        onChange(nextValue);
    };

    return (
        <div className="quantity-selector">
            <button
                type="button"
                className="qty-btn"
                onClick={() => adjustment(-1)}
                disabled={quantity <= 1}
            >
                −
            </button>

            <input
                type="number"
                className="qty-input"
                value={quantity}
                min={1}
                onChange={handleInputChange}
            />

            <button
                type="button"
                className="qty-btn"
                onClick={() => adjustment(1)}
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;