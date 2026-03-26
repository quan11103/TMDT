import React from 'react';
import type { CartItem } from '../../types';
import CartItemQuantity from './CartItemQty';
import './ItemDetail.css';

interface Props {
    item: CartItem;
    onChangeQuantity: (value: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const ItemDetail: React.FC<Props> = ({ item, onChangeQuantity, onRemoveItem }) => {
    const { name, price, stock } = item.products;
    const { quantity } = item;

    const productUrl = `/product/${item.products.id}`;

    return (
        <div className="item-detail-container">
            {/* Phần nội dung chính (Checkbox bây giờ sẽ được đặt bên ngoài component này) */}
            <div className="item-main-content">
                <div className="item-header-row">
                    <a href={productUrl} className="product-link">
                        <h2 className="product-name">{name}</h2>
                    </a>

                    <button
                        className="remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="Xóa sản phẩm"
                    >
                        <svg className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                    </button>
                </div>

                <div className="item-attributes">
                    <p className="attr-row">
                        <span className="attr-label">Tình trạng:</span>
                        <span className="attr-value" style={{ color: stock > 0 ? '#28a745' : '#dc3545' }}>
                            {stock > 0 ? `Còn hàng (${stock})` : 'Hết hàng'}
                        </span>
                    </p>
                </div>

                <div className="item-unit-price">
                    <p className="cart-price-wrapper">
                        <span className="price-num">{price.toLocaleString()}</span>
                        <span className="price-unit"> VND</span>
                    </p>
                </div>

                <div className="item-quantity-section">
                    <CartItemQuantity
                        price={price}
                        quantity={quantity}
                        stock={stock}
                        onChangeQuantity={onChangeQuantity}
                    />
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;