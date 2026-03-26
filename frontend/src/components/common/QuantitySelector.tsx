import React from 'react';
import './QuantitySelector.css';

interface Props {
    quantity: number | string;
    onChange: (value: number | string) => void;
    max: number; // Thêm giới hạn tối đa vào interface
}

const QuantitySelector: React.FC<Props> = ({ quantity, onChange, max }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            onChange('');
            return;
        }

        const numValue = parseInt(val, 10);
        if (!isNaN(numValue)) {
            // Cho phép gõ tự do, sẽ chuẩn hóa khi click ra ngoài (Blur)
            onChange(numValue);
        }
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Chỉnh sửa hàm handleBlur để xử lý cả trường hợp > tồn kho
    const handleBlur = () => {
        let val = Number(quantity);

        if (quantity === '' || val < 1) {
            onChange(1);
        } else if (val > max) {
            onChange(max); // Nếu lớn hơn tồn kho thì tự động đưa về max
        }
    };

    const adjustment = (step: number) => {
        const currentQty = typeof quantity === 'string' ? 0 : quantity;
        const nextValue = currentQty + step;

        // Đảm bảo nút +/- không vượt quá giới hạn [1, max]
        if (nextValue >= 1 && nextValue <= max) {
            onChange(nextValue);
        }
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
                max={max} // Thêm thuộc tính max cho input
                onChange={handleInputChange}
                onBlur={handleBlur}
            />

            <button
                type="button"
                className="qty-btn"
                onClick={() => adjustment(1)}
                disabled={Number(quantity) >= max} // Disable nút + khi đã đạt trần tồn kho
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;