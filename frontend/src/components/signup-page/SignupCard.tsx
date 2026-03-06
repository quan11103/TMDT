import React, { useState } from "react";
import "./SignupCard.css";
import SignupFooter from "./SignupFooter";

const SignupCard: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý đăng ký tại đây
    };

    return (
        <div className="signup-card">
            <form className="signup-form" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Địa Chỉ Email *</label>
                    <input type="email" id="email" name="email" placeholder="Nhập email" required />
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Mật Khẩu *</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                        <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input type="text" id="phone" name="phone" placeholder="Nhập số điện thoại" maxLength={12} required />
                </div>

                {/* Full Name */}
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên *</label>
                    <input type="text" id="fullName" name="fullName" placeholder="Nhập đầy đủ họ và tên" required />
                </div>

                {/* Date of Birth */}
                <div className="form-group relative">
                    <div className="space-y-2">
                        <label
                            className="text-sm font-medium leading-none"
                            htmlFor="date_of_birth"
                        >
                            Ngày sinh *
                        </label>
                        <input
                            type="text"
                            className="form-dob"
                            id="date_of_birth"
                            name="date_of_birth"
                            placeholder="dd/mm/yyyy"
                            required
                        />
                        <button className="calendar-btn" type="button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-calendar"
                            >
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Gender */}
                <div className="form-group mb-large">
                    <label>Giới tính</label>
                    <select name="gender" className="gender-select">
                        <option value="1">Nam</option>
                        <option value="2">Nữ</option>
                        <option value="3">Khác</option>
                    </select>
                </div>

                {/* Checkboxes */}
                <div className="checkbox-group mt-large">
                    <label className="checkbox-item">
                        <input type="checkbox" name="newsletter" />
                        <span>Đăng ký nhận thông tin (Tùy chọn)</span>
                    </label>

                    <label className="checkbox-item">
                        <input type="checkbox" name="terms" required />
                        <span>
                            Tôi trên 16 tuổi và đồng ý với <a href="/terms">Điều khoản và Điều kiện</a>
                        </span>
                    </label>
                </div>

                <p className="privacy-note">
                    Bằng việc tiếp tục đăng ký, tôi xác nhận rằng tôi đã đọc và đồng ý với Điều khoản sử dụng và Chính sách bảo mật của MUJI...
                </p>

                <button type="submit" className="btn-signup">
                    Tạo Tài Khoản Mới
                </button>
            </form>

            <SignupFooter />
        </div>
    );
};

export default SignupCard;