import React from 'react';
import QuantitySelector from './QuantitySelector';
import './CartItem.css'; // Đảm bảo import CSS

interface ItemProps {
    id: number;
    image: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    onRemove: (id: number) => void;
    onUpdateQty: (id: number, q: number) => void;
}

const CartItem: React.FC<ItemProps> = ({ id, image, name, size, color, price, quantity, onRemove, onUpdateQty }) => {

    // Hàm xử lý khi gõ bàn phím cho từng Item
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            onUpdateQty(id, 0); // Tạm thời để 0 hoặc dùng type khác tùy logic
        } else {
            const num = parseInt(val);
            if (!isNaN(num) && num > 0) {
                onUpdateQty(id, num);
            }
        }
    };

    const handleBlur = () => {
        if (quantity < 1) {
            onUpdateQty(id, 1);
        }
    };

    return (
        <div className="cart-item">
            <div className="cart-item-img-wrapper">
                <img src={image} alt={name} />
            </div>

            <div className="cart-item-info">
                <div className="cart-item-header">
                    <h4 className="item-name">{name}</h4>
                    <button className="btn-delete" onClick={() => onRemove(id)}>
                        <img src="/icons/trash-red.svg" alt="delete" />
                    </button>
                </div>

                <div className="cart-item-specs">
                    <p>Size: <span className="spec-val">{size}</span></p>
                    <p>Color: <span className="spec-val">{color}</span></p>
                </div>

                <div className="cart-item-footer">
                    <span className="item-price">${price}</span>
                    <QuantitySelector
                        quantity={quantity === 0 ? '' : quantity}
                        onIncrease={() => onUpdateQty(id, quantity + 1)}
                        onDecrease={() => onUpdateQty(id, Math.max(1, quantity - 1))}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        </div>
    );
};

export default CartItem;