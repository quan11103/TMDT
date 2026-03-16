import React from 'react';
import './QuantitySelector.css';

interface QuantitySelectorProps {
    quantity: number | string;
    onChange: (value: number | string) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onChange }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Nếu là chuỗi rỗng, cho phép cập nhật để người dùng xóa được số
        if (val === '') {
            onChange('');
            return;
        }

        const numValue = parseInt(val, 10);
        if (!isNaN(numValue)) {
            // Không chặn value < 1 ở đây để tránh giật lag khi gõ
            onChange(numValue);
        }
    };

    // Hàm quan trọng: Khi người dùng bấm ra ngoài, nếu đang trống hoặc < 1 thì đưa về 1
    const handleBlur = () => {
        if (quantity === '' || Number(quantity) < 1) {
            onChange(1);
        }
    };

    const adjustment = (step: number) => {
        const currentQty = typeof quantity === 'string' ? 0 : quantity;
        const nextValue = Math.max(1, currentQty + step);
        onChange(nextValue);
    };

    return (
        <div className="quantity-selector">
            <button
                type="button"
                className="qty-btn"
                onClick={() => adjustment(-1)}
                disabled={Number(quantity) <= 1}
            >
                −
            </button>

            <input
                type="number"
                className="qty-input"
                value={quantity}
                min={1}
                onChange={handleInputChange}
                onBlur={handleBlur} // Thêm sự kiện onBlur
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