import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            {/* Newsletter Section */}
            <div className="newsletter">
                <h2>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
                <div className="newsletter-form">
                    <input type="email" placeholder="Enter your email address" />
                    <button>Subscribe to Newsletter</button>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo">SHOP.CO</div>
                    <p>We have clothes that suits your style and which you're proud to wear. From women to men.</p>
                    <div className="socials">
                        <a href="https://twitter.com" target="_blank" rel="noreferrer">
                            <img src="/logos/twitter.svg" alt="Twitter" className="social-icon" />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer">
                            <img src="/logos/facebook.svg" alt="Facebook" className="social-icon" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer">
                            <img src="/logos/instagram.svg" alt="Instagram" className="social-icon" />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noreferrer">
                            <img src="/logos/github.svg" alt="Github" className="social-icon" />
                        </a>
                    </div>
                </div>

                <div className="footer-links">
                    <div>
                        <h3>COMPANY</h3>
                        <ul><li>About</li><li>Features</li><li>Works</li><li>Career</li></ul>
                    </div>
                    <div>
                        <h3>HELP</h3>
                        <ul><li>Customer Support</li><li>Delivery Details</li><li>Terms & Conditions</li><li>Privacy Policy</li></ul>
                    </div>
                    <div>
                        <h3>FAQ</h3>
                        <ul><li>Account</li><li>Manage Deliveries</li><li>Orders</li><li>Payments</li></ul>
                    </div>
                    <div>
                        <h3>RESOURCES</h3>
                        <ul><li>Free eBooks</li><li>Development Tutorial</li><li>How to - Blog</li><li>Youtube Playlist</li></ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>Shop.co © 2000-2023, All Rights Reserved</p>
                <div className="payments">
                    <div className="payment-card">
                        <img src="/logos/visa.svg" alt="Visa" />
                    </div>
                    <div className="payment-card">
                        <img src="/logos/mastercard.svg" alt="Mastercard" />
                    </div>
                    <div className="payment-card">
                        <img src="/logos/paypal.svg" alt="Paypal" />
                    </div>
                    <div className="payment-card">
                        <img src="/logos/apple-pay.svg" alt="Apple Pay" />
                    </div>
                    <div className="payment-card">
                        <img src="/logos/google-pay.svg" alt="Google Pay" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;