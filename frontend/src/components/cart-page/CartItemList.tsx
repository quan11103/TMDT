import React from 'react';
import type { CartItem } from '../../types';
import CartItemWrapper from './CartItemWrapper';
import './CartItemList.css';

interface Props {
    items: CartItem[];
    onChangeQuantity: (id: number, quantity: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const CartItemList: React.FC<Props> = ({ items, onChangeQuantity, onRemoveItem }) => {

    return (
        <div className="cart-item-list">
            {items.map((item) => (
                <CartItemWrapper
                    // Sử dụng item.id (ID của cart_items) làm key để tối ưu render
                    key={item.id}
                    item={item}
                    onChangeQuantity={onChangeQuantity}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </div>
    );
};

export default CartItemList;