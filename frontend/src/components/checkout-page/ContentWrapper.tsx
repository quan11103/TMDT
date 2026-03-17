import React, { useState } from 'react';
import './ContentWrapper.css';
import type { ShippingInfo, CartItem } from '../../types';
import ShippingAddress from './ShippingAddress';
import PaymentMethod from './PaymentMethod';
import Coupon from './Coupon';
import OrderSummary from './OrderSummary';

interface Props {
    items: CartItem[];
}

const ContentWrapper: React.FC<Props> = ({ items }) => {
    const [address, setAddress] = useState<ShippingInfo>({
        email: "", fullName: "", phone: "", province: "", ward: "", street: "", note: "", addrType: "home"
    });

    return (
        <div className="checkout-wrapper">
            <div className="checkout-container">

                <div className="checkout-left">
                    <ShippingAddress address={address} setAddress={setAddress} />
                </div>

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
                                <OrderSummary items={items} shippingInfo={address} />
                            </div>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContentWrapper;