import React from 'react';
import './CheckoutForm.css';

const CheckoutForm: React.FC = () => {
    return (
        <div className="checkout-card">
            <h3 className="section-title">Shipping Details</h3>
            <form className="shipping-form">
                <div className="input-row">
                    <input type="text" placeholder="First Name" className="auth-input" />
                    <input type="text" placeholder="Last Name" className="auth-input" />
                </div>
                <input type="email" placeholder="Email Address" className="auth-input" />
                <input type="text" placeholder="Street Address" className="auth-input" />
                <div className="input-row">
                    <input type="text" placeholder="City" className="auth-input" />
                    <input type="text" placeholder="Phone Number" className="auth-input" />
                </div>
            </form>

            <h3 className="section-title" style={{ marginTop: '40px' }}>Payment Method</h3>
            <div className="payment-options">
                <label className="payment-card active">
                    <input type="radio" name="payment" defaultChecked />
                    <span>Credit Card</span>
                    <img src="/logos/mastercard.svg" alt="cards" />
                </label>
                <label className="payment-card">
                    <input type="radio" name="payment" />
                    <span>PayPal</span>
                    <img src="/logos/paypal.svg" alt="paypal" />
                </label>
            </div>
        </div>
    );
};

export default CheckoutForm;