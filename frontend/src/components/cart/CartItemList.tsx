import React from 'react';
import './CartItemList.css';

interface CartItemListProps {
    children: React.ReactNode;
}

const CartItemList: React.FC<CartItemListProps> = ({ children }) => {
    return (
        <div className="cart-item-list-container">
            {children}
        </div>
    );
};

export default CartItemList;