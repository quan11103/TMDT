import React, { useState } from 'react';
import ForgotPasswordFlow from '../components/forgot-password-page/ForgotPasswordFlow';

const ForgotPasswordPage: React.FC = () => {
    // State để nhận thông tin tiêu đề từ Flow truyền ra
    const [header, setHeader] = useState({ title: 'Quên mật khẩu?', description: '' });

    // Hàm cập nhật tiêu đề dựa trên trạng thái của Flow
    const handleStatusChange = (status: string) => {
        const meta: Record<string, { t: string; d: string }> = {
            SEND_EMAIL: { t: 'Quên mật khẩu?', d: 'Nhập email để nhận mã khôi phục.' },
            WAITING_CONFIRM: { t: 'Kiểm tra Email', d: 'Chúng tôi đã gửi liên kết đến hộp thư của bạn.' },
            RESET_PASSWORD: { t: 'Mật khẩu mới', d: 'Thiết lập lại mật khẩu cho tài khoản.' },
            SUCCESS: { t: 'Thành công!', d: 'Mật khẩu của bạn đã được thay đổi.' },
            ERROR: { t: 'Lỗi xác thực', d: 'Liên kết không hợp lệ hoặc đã hết hạn.' },
        };

        const currentMeta = meta[status] || meta['SEND_EMAIL'];
        setHeader({ title: currentMeta.t, description: currentMeta.d });
    };

    return (
        <ForgotPasswordFlow onStatusChange={handleStatusChange} />
    );
};

export default ForgotPasswordPage;