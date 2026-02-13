import React, { useState } from 'react';
import './CheckoutPage.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const CheckoutPage: React.FC = () => {
    // State giả lập
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

    // Giả sử tổng tiền tính toán được từ Cart
    const totalAmount = 467;

    return (
        <>
            <Header />
            <div className="checkout-page">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs">
                    <span>Home &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span> &nbsp; Cart &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span className="current"> &nbsp; Checkout</span>
                </nav>

                <h2 className="checkout-heading">CHECKOUT</h2>

                <form className="checkout-form-container" onSubmit={(e) => e.preventDefault()}>
                    <div className="checkout-split-layout">

                        {/* CỘT 1: SHIPPING DETAILS */}
                        <div className="checkout-section section-shipping">
                            <h3 className="section-title">Shipping Details</h3>

                            <div className="form-group-row">
                                <input type="text" placeholder="First Name" className="shop-input" required />
                                <input type="text" placeholder="Last Name" className="shop-input" required />
                            </div>

                            <input type="email" placeholder="Email Address" className="shop-input full-width" required />

                            <input type="text" placeholder="Street Address" className="shop-input full-width" required />

                            <div className="form-group-row">
                                <input type="text" placeholder="City" className="shop-input" required />
                                <input type="text" placeholder="State / Province" className="shop-input" />
                            </div>

                            <div className="form-group-row">
                                <input type="text" placeholder="Zip Code" className="shop-input" />
                                <input type="tel" placeholder="Phone Number" className="shop-input" required />
                            </div>
                        </div>

                        {/* CỘT 2: PAYMENT & ACTION */}
                        <div className="checkout-section section-payment">
                            <h3 className="section-title">Payment Method</h3>

                            <div className="payment-selector">
                                <div
                                    className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <div className="radio-circle"></div>
                                    <span className="payment-label">Credit Card</span>
                                    <div className="payment-icons">
                                        <img src="/logos/visa.svg" className="payment-logo-img" alt="visa" />
                                        <img src="/logos/mastercard.svg" className="payment-logo-img" alt="master" />
                                    </div>
                                </div>

                                <div
                                    className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('paypal')}
                                >
                                    <div className="radio-circle"></div>
                                    <span className="payment-label">PayPal</span>
                                    <img src="/logos/paypal.svg" className="payment-logo-img" alt="paypal" />
                                </div>
                            </div>

                            {/* Form thẻ tín dụng */}
                            {paymentMethod === 'card' && (
                                <div className="card-details-form">
                                    <input type="text" placeholder="Card Number" className="shop-input full-width" />
                                    <div className="form-group-row" style={{ marginBottom: 0 }}>
                                        <input type="text" placeholder="MM / YY" className="shop-input" />
                                        <input type="text" placeholder="CVC" className="shop-input" />
                                    </div>
                                </div>
                            )}

                            {/* ACTION AREA: Tổng tiền + Nút bấm */}
                            <div className="checkout-action-area">
                                <div className="checkout-total-summary">
                                    <span className="total-label">Total to pay:</span>
                                    <span className="total-value">${totalAmount}</span>
                                </div>

                                <button type="submit" className="btn-checkout-full">
                                    Confirm Payment
                                    <img src="/icons/arrow-right-white.svg" alt="arrow" />
                                </button>

                                <p className="secure-note">
                                    <img src="/icons/lock.svg" alt="lock" />
                                    Your payment information is safe.
                                </p>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;