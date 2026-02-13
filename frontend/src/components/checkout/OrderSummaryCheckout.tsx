import React from 'react';
import './OrderSummaryCheckout.css';

const OrderSummaryCheckout: React.FC = () => {
    return (
        <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="mini-item-list">
                <div className="mini-item">
                    <img src="/images/p10.svg" alt="p1" />
                    <div className="mini-info">
                        <p className="mini-name">Gradient Graphic T-shirt</p>
                        <p className="mini-price">$145</p>
                    </div>
                </div>
            </div>

            <hr className="divider" />

            <div className="summary-row">
                <span>Subtotal</span>
                <span className="bold">$565</span>
            </div>
            <div className="summary-row">
                <span>Discount (-20%)</span>
                <span className="bold red">-$113</span>
            </div>
            <div className="summary-row">
                <span>Delivery Fee</span>
                <span className="bold">$15</span>
            </div>

            <hr className="divider" />

            <div className="summary-row total">
                <span>Total</span>
                <span className="total-price">$467</span>
            </div>

            <button className="btn-pay-now">
                Pay Now
                <img src="/icons/arrow-right-white.svg" alt="arrow" />
            </button>
        </div>
    );
};

export default OrderSummaryCheckout;