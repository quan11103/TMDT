import React from 'react';
import './LoginPage.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const Login: React.FC = () => {
    return (
        <>
            <Header />
            <div className="login-page">
                <div className="container">
                    <div className="login-card-wrapper">
                        <div className="login-card">
                            <h2 className="login-title">LOG IN</h2>
                            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                                {/* Email Input - Style bo góc 62px giống Promo Code */}
                                <div className="auth-input-group">
                                    <img src="/icons/email.svg" alt="email" className="auth-icon" />
                                    <input type="email" placeholder="Email Address" required />
                                </div>

                                {/* Password Input */}
                                <div className="auth-input-group">
                                    <img src="/icons/lock.svg" alt="lock" className="auth-icon" />
                                    <input type="password" placeholder="Password" required />
                                </div>

                                <div className="auth-helpers">
                                    <label className="remember-me">
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <a href="#" className="forgot-password">Forgot Password?</a>
                                </div>

                                {/* Main Button - Style đen bo góc giống Go to Checkout */}
                                <button type="submit" className="btn-login-main">
                                    Log In
                                </button>
                            </form>

                            <div className="social-divider">
                                <span>Or continue with</span>
                            </div>

                            {/* Social Login - Phù hợp style hiện đại */}
                            <div className="social-group">
                                <button className="btn-social">
                                    <img src="/logos/google.svg" alt="google" />
                                    Google
                                </button>
                                <button className="btn-social">
                                    <img src="/logos/facebook.svg" alt="facebook" />
                                    Facebook
                                </button>
                            </div>

                            <p className="auth-footer">
                                Don't have an account? <a href="/signup">Sign Up</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;