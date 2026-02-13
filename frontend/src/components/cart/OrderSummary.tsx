import React from 'react';
import SummaryRow from './SummaryRow';
import PromoCodeForm from './PromoCodeForm';
import CheckoutButton from './CheckoutButton';

interface SummaryProps {
    subtotal: number;
    discount: number;
    deliveryFee: number;
}

const OrderSummary: React.FC<SummaryProps> = ({ subtotal, discount, deliveryFee }) => {
    return (
        <div className="order-summary-box">
            <h3>Order Summary</h3>
            <SummaryRow label="Subtotal" value={subtotal} />
            <SummaryRow label="Discount (-20%)" value={discount} isDiscount />
            <SummaryRow label="Delivery Fee" value={deliveryFee} />
            <hr />
            <SummaryRow label="Total" value={subtotal - discount + deliveryFee} isTotal />

            <PromoCodeForm />
            <CheckoutButton />
        </div>
    );
};

export default OrderSummary;