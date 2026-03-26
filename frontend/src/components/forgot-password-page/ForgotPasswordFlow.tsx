import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ForgotPasswordFlow.css';

type FlowStatus = 'SEND_EMAIL' | 'WAITING_CONFIRM' | 'RESET_PASSWORD' | 'SUCCESS' | 'ERROR';

interface FlowProps {
    onStatusChange: (status: FlowStatus) => void;
}

const ForgotPasswordFlow: React.FC<FlowProps> = ({ onStatusChange }) => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<FlowStatus>(token ? 'RESET_PASSWORD' : 'SEND_EMAIL');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Thông báo trạng thái ra bên ngoài (để Layout đổi title/description)
    useEffect(() => {
        onStatusChange(status);
    }, [status, onStatusChange]);

    const handleSendEmail = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) setStatus('WAITING_CONFIRM');
            else alert('Email không tồn tại hoặc lỗi hệ thống');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword }),
            });
            if (res.ok) setStatus('SUCCESS');
            else setStatus('ERROR');
        } finally { setLoading(false); }
    };

    return (
        <div className="flow-container">
            {status === 'SEND_EMAIL' && (
                <div className="step-content">
                    <div className="form-group">
                        <label>Email tài khoản</label>
                        <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn..." />
                    </div>
                    <button className="auth-button" onClick={handleSendEmail} disabled={loading}>Gửi liên kết khôi phục</button>
                </div>
            )}

            {status === 'WAITING_CONFIRM' && (
                <div className="step-content text-center">
                    <div className="icon">✉️</div>
                    <p>Liên kết đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.</p>
                </div>
            )}

            {status === 'RESET_PASSWORD' && (
                <div className="step-content">
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input type="password" className="auth-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <button className="auth-button" onClick={handleResetPassword} disabled={loading}>Xác nhận mật khẩu mới</button>
                </div>
            )}

            {status === 'SUCCESS' && (
                <div className="step-content text-center">
                    <div className="icon success">✓</div>
                    <p>Mật khẩu đã được cập nhật thành công!</p>
                    <button className="auth-button" onClick={() => window.location.href = '/login'}>Đăng nhập ngay</button>
                </div>
            )}

            {status === 'ERROR' && (
                <div className="step-content text-center">
                    <p className="error-text">Token không hợp lệ hoặc đã hết hạn.</p>
                    <button className="auth-button outline" onClick={() => setStatus('SEND_EMAIL')}>Yêu cầu lại mã mới</button>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordFlow;