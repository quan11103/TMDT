import React, { useState } from 'react';
import './FormForgotPassword.css';

interface FormResetPasswordProps {
    token: string;
    onSubmit: (newPassword: string) => Promise<void>;
    isLoading?: boolean;
}

const FormResetPassword: React.FC<FormResetPasswordProps> = ({
    token,
    onSubmit,
    isLoading,
}) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [localError, setLocalError] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        if (password.length < 6) {
            setLocalError('Mật khẩu cần ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirm) {
            setLocalError('Mật khẩu nhập lại không khớp.');
            return;
        }
        if (!token.trim()) {
            setLocalError('Liên kết không hợp lệ. Vui lòng gửi lại email đặt lại mật khẩu.');
            return;
        }
        await onSubmit(password);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="card-header">
                    <h3 className="form-title">Đặt mật khẩu mới</h3>
                </div>

                <div className="card-content">
                    <p className="form-description">
                        Nhập mật khẩu mới cho tài khoản của bạn. Sau khi hoàn tất, bạn có thể đăng nhập
                        bằng mật khẩu này.
                    </p>

                    {localError ? (
                        <p className="reset-password-inline-error" role="alert">
                            {localError}
                        </p>
                    ) : null}

                    <form onSubmit={handleFormSubmit} className="forgot-password-form">
                        <div className="input-group">
                            <label htmlFor="new-password">
                                Mật khẩu mới <span className="required">*</span>
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                name="new-password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="form-input"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirm-password">
                                Nhập lại mật khẩu <span className="required">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                minLength={6}
                                className="form-input"
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Đang xử lý…' : 'Xác nhận mật khẩu mới'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormResetPassword;
