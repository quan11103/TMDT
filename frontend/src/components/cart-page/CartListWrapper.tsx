import React from 'react';
import type { CartItem } from '../../types';
import CartItemList from './CartItemList';
import './CartListWrapper.css';

interface Props {
    items: CartItem[];
    onChangeQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
}

const CartListWrapper: React.FC<Props> = ({ items, onChangeQuantity, onRemoveItem }) => {
    const itemCount = items.length;

    return (
        <div className="cart-list-container">
            {/* Header của danh sách */}
            <div className="cart-list-header">
                <p className="header-title">Mặt hàng ({itemCount})</p>
                <p className="header-label">Tạm tính</p>
            </div>

            {/* Vùng chứa danh sách sản phẩm */}
            <div className="cart-list-content">
                <CartItemList items={items} onChangeQuantity={onChangeQuantity} onRemoveItem={onRemoveItem} />
            </div>
        </div>
    );
};

export default CartListWrapper;