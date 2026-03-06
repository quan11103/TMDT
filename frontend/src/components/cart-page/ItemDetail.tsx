import React from 'react';
import CartItemQuantity from './CartItemQty';
import './ItemDetail.css';
import type { CartItem } from '../../types';

interface Props {
    item: CartItem;
    onChangeQuantity: (value: number) => void;
    onRemoveItem: (id: string) => void;
}

const ItemDetail: React.FC<Props> = ({ item, onChangeQuantity, onRemoveItem }) => {
    const { name, price, productUrl, quantity } = item;
    return (
        <div className="item-detail-container">
            <div className="item-header-row">
                <a href={productUrl} className="product-link">
                    <h2 className="product-name">
                        {name}
                    </h2>
                </a>

                <button
                    className="remove-btn"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Xóa sản phẩm"
                >
                    <svg
                        className="trash-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                </button>
            </div>

            {/* Thuộc tính sản phẩm (Màu sắc, kích thước...) */}
            <div className="item-attributes">
                <p className="attr-row">
                    <span className="attr-label">Màu sắc</span>
                    <span className="attr-value">Xanh Dương</span>
                </p>
            </div>

            {/* Đơn giá sản phẩm */}
            <div className="item-unit-price">
                <p className="price-wrapper">
                    <span className="price-num">{price.toLocaleString()}</span>
                    <span className="price-unit"> VND</span>
                </p>
            </div>

            {/* Phần số lượng và Tạm tính (Component đã build) */}
            <div className="item-quantity-section">
                <CartItemQuantity price={price} quantity={quantity} onChangeQuantity={onChangeQuantity} />
            </div>
        </div>
    );
};

export default ItemDetail;