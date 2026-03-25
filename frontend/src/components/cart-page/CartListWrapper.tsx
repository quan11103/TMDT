import React from 'react';
import type { CartItem } from '../../types';
import CartItemList from './CartItemList';
import './CartListWrapper.css';

interface Props {
    items: CartItem[];
    selectedIds: number[];
    onSelect: (id: number) => void;
    onSelectAll: (allIds: number[]) => void;
    onChangeQuantity: (id: number, quantity: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const CartListWrapper: React.FC<Props> = ({ items, selectedIds, onSelect, onSelectAll, onChangeQuantity, onRemoveItem }) => {
    const itemCount = items.length;

    const isAllSelected = items.length > 0 && selectedIds.length === items.length;
    const allItemIds = items.map(item => item.id);

    return (
        <div className="cart-list-container">
            {/* Header của danh sách */}
            <div className="cart-list-header">
                <div className="header-left-section">
                    <p className="header-title">Mặt hàng ({itemCount})</p>

                    {/* Checkbox chọn tất cả nằm bên dưới chữ Mặt hàng */}
                    <div className="select-all-wrapper">
                        <input
                            type="checkbox"
                            id="select-all-main"
                            className="item-checkbox"
                            checked={isAllSelected}
                            onChange={() => onSelectAll(allItemIds)}
                        />
                        <label htmlFor="select-all-main" className="select-all-label">
                            Chọn tất cả
                        </label>
                    </div>
                </div>
            </div>

            {/* Vùng chứa danh sách sản phẩm */}
            <div className="cart-list-content">
                <CartItemList
                    items={items}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                    onChangeQuantity={onChangeQuantity}
                    onRemoveItem={onRemoveItem}
                />
            </div>
        </div>
    );
};

export default CartListWrapper;