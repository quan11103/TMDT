// SignUpPage.tsx
import React from 'react';
import './SignUpPage.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AuthInput from '../components/signup/AuthInput';
import SocialLogin from '../components/signup/SocialLogin';
import AuthDivider from '../components/signup/AuthDivider';

const SignUpPage: React.FC = () => {
    return (
        <>
            <Header />
            <div className="signup-page">
                <div className="container">
                    <div className="auth-card-wrapper">
                        <div className="auth-card">
                            <h2 className="auth-title">CREATE ACCOUNT</h2>

                            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                                <AuthInput type="text" placeholder="Full Name" icon="/icons/user.svg" />
                                <AuthInput type="email" placeholder="Email Address" icon="/icons/email.svg" />
                                <AuthInput type="password" placeholder="Password" icon="/icons/lock.svg" />
                                <AuthInput type="password" placeholder="Confirm Password" icon="/icons/lock.svg" />

                                <div className="terms-check">
                                    <label>
                                        <input type="checkbox" required />
                                        I agree to the <a href="#">Terms & Conditions</a>
                                    </label>
                                </div>

                                <button type="submit" className="btn-auth-main">
                                    Sign Up
                                </button>
                            </form>

                            <AuthDivider text="Or sign up with" />
                            <SocialLogin />

                            <p className="auth-footer">
                                Already have an account? <a href="/login">Log In</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SignUpPage;