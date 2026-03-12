import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginCard.css";
import LoginFooter from "./LoginFooter";

const LoginCard: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", {
                email,
                password,
            });

            const { access_token, user } = response.data;

            // 1. Lưu token
            localStorage.setItem("access_token", access_token);

            // 2. Lưu user (nếu backend có trả về)
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            // 3. Chuyển hướng về trang chủ
            navigate("/");

            // 4. Reload nhẹ trang để Header nhận state mới (hoặc dùng Context)
            window.location.reload();

        } catch (err: any) {
            const message = err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card">
            <form className="login-form" onSubmit={handleSubmit}>
                {/* Hiển thị thông báo lỗi nếu có */}
                {error && <div className="error-alert">{error}</div>}

                {/* Email Field */}
                <div className="form-group">
                    <label htmlFor="email">Địa chỉ Email *</label>
                    <input
                        className="email"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
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