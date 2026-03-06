import React from 'react';
import CartItemWrapper from './CartItemWrapper';
import './CartItemList.css';
import type { CartItem } from '../../types';

interface Props {
    items: CartItem[];
    onChangeQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
}

const CartItemList: React.FC<Props> = ({ items, onChangeQuantity, onRemoveItem }) => {

    return (
        <div className="cart-item-list">
            {items.map((item) => (
                <CartItemWrapper
                    key={item.id}
                    item={item}
                    onChangeQuantity={onChangeQuantity}
                    onRemoveItem={onRemoveItem} />
            ))}
        </div>
    );
};

export default CartItemList;