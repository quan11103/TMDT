import React from 'react';
import type { CartItem } from '../../types';
import './ContentWrapper.css';
import CartListWrapper from './CartListWrapper';
import OrderSummary from './OrderSummary';

interface Props {
    items: CartItem[];
    selectedIds: number[];
    onSelect: (id: number) => void;
    onSelectAll: (allIds: number[]) => void;
    totalAmount: number;
    onChangeQuantity: (id: number, quantity: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const ContentWrapper: React.FC<Props> = ({ items, selectedIds, onSelect, onSelectAll, totalAmount, onChangeQuantity, onRemoveItem }) => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    return (
        <div className="content-layout">
            <div className="layout-left">
                {/* 1. Nếu giỏ hàng trống, hiển thị thông báo thay vì render list */}
                {items.length === 0 ? (
                    <div className="empty-cart-msg">
                        Giỏ hàng của bạn đang trống.
                    </div>
                ) : (
                    <CartListWrapper
                        items={items}
                        selectedIds={selectedIds}
                        onSelect={onSelect}
                        onSelectAll={onSelectAll}
                        onChangeQuantity={onChangeQuantity}
                        onRemoveItem={onRemoveItem}
                    />
                )}
            </div>
            <div className="layout-right">
                {/* 2. Truyền items và totalAmount vào OrderSummary */}
                <OrderSummary
                    selectedItems={selectedItems}
                    totalAmount={totalAmount}
                />
            </div>
        </div>
    );
};

export default ContentWrapper;