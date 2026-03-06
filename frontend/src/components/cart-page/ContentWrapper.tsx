import React from 'react';
import type { CartItem } from '../../types';
import './ContentWrapper.css';
import CartListWrapper from './CartListWrapper';
import OrderSummary from './OrderSummary';

interface Props {
    items: CartItem[];
    onChangeQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
}

const ContentWrapper: React.FC<Props> = ({ items, onChangeQuantity, onRemoveItem }) => {

    return (
        <div className="content-layout">
            <div className="layout-left">
                <CartListWrapper
                    items={items}
                    onChangeQuantity={onChangeQuantity}
                    onRemoveItem={onRemoveItem}
                />
            </div>
            <div className="layout-right">
                <OrderSummary items={items} />
            </div>
        </div>
    );
};

export default ContentWrapper;