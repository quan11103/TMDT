import React, { useState } from 'react';
import './FormForgotPassword.css';

interface ForgotPasswordFormProps {
    onSubmit: (email: string) => void;
    isLoading?: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, isLoading }) => {
    const [email, setEmail] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            onSubmit(email);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="card-header">
                    <h3 className="form-title">Quên Mật Khẩu</h3>
                </div>

                <div className="card-content">
                    <p className="form-description">
                        Vui lòng nhập địa chỉ email đã đăng ký và thông tin xác nhận.
                        Chúng tôi sẽ gửi cho bạn một liên kết qua email để đặt lại mật khẩu của bạn.
                    </p>

                    <form onSubmit={handleFormSubmit} className="forgot-password-form">
                        <div className="input-group">
                            <label htmlFor="email">Địa chỉ Email <span className="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;