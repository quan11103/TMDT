import React from 'react';
import './SubTotal.css';

interface Props {
    price: number;
    quantity: number;
}

const SubTotal: React.FC<Props> = ({ price, quantity }) => {
    const total = price * quantity;
    return (
        <div className="subtotal-wrapper">
            <p className="subtotal-label">Tạm tính (Đã bao gồm thuế)</p>
            <p className="subtotal-price">
                <span className="price-number">{total.toLocaleString()}</span>
                <span className="price-unit"> VND</span>
            </p>
        </div>
    );
};

export default SubTotal;