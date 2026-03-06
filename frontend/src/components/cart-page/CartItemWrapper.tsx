import React from 'react';
import './CartItemWrapper.css';
import type { CartItem } from '../../types';
import ItemDetail from './ItemDetail';

interface Props {
    item: CartItem;
    onChangeQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
}

const CartItemWrapper: React.FC<Props> = ({ item, onChangeQuantity, onRemoveItem }) => {
    return (
        <div className="cart-item-wrapper">
            <div className="cart-item-container">
                {/* Khối hình ảnh */}
                <div className="item-img-wrapper">
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="product-img"
                    />
                </div>

                {/* Component chi tiết sản phẩm (đã chứa Quantity & SubTotal) */}
                <ItemDetail
                    item={item}
                    onChangeQuantity={(value) =>
                        onChangeQuantity(item.id, value)
                    }
                    onRemoveItem={onRemoveItem}
                />

            </div>
        </div>
    );
};

export default CartItemWrapper;