import React from 'react';
import './ContentWrapper.css';
import type { Product } from '../../types';
import ShippingAddress from './ShippingAddress';
import PaymentMethod from './PaymentMethod';
import Coupon from './Coupon';
import OrderSummary from './OrderSummary';

interface Props {
    items: Product[];
}

const ContentWrapper: React.FC<Props> = ({ items }) => {
    return (
        <div className="checkout-wrapper">
            <div className="checkout-container">

                {/* Cột bên trái: Chiếm toàn chiều rộng trên mobile, 50-60% trên desktop */}
                <div className="checkout-left">
                    <ShippingAddress />
                </div>

                {/* Cột bên phải: Chứa Payment, Coupon và Order Summary */}
                <div className="checkout-right">
                    <div className="sticky-content">
                        <section className="section-card">
                            <PaymentMethod />
                        </section>

                        <section className="section-card">
                            <Coupon />
                        </section>

                        <section className="section-card">
                            <div className="summary-container">
                                <OrderSummary items={items} />
                            </div>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContentWrapper;