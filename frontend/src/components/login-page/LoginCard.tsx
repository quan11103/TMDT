import React, { useState } from "react";
import "./LoginCard.css";
import LoginFooter from "./LoginFooter";

const LoginCard: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý đăng nhập tại đây
    };

    return (
        <div className="login-card">
            <form className="login-form" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-group">
                    <label htmlFor="email">Địa chỉ Email *</label>
                    <input
                        className="email"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Nhập địa chỉ email"
                        required
                    />
                </div>

                {/* Password Field */}
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu *</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            className="input-password"
                            required
                        />
                        <div className="eye-icon" onClick={togglePassword}>
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                            )}
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-login">
                    Đăng nhập
                </button>
            </form>

            <div className="forgot-password">
                <a href="/vn/forgot-password">Quên Mật Khẩu?</a>
            </div>
            <LoginFooter />
        </div>
    );
};

export default LoginCard;