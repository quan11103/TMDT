import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ForgotPasswordForm from '../components/forgot-password-page/FormForgotPassword';
import FormResetPassword from '../components/forgot-password-page/FormResetPassword';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ForgotPasswordPage.css';
import { API_BASE } from '../lib/apiConfig';

const ForgotPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const resetToken = useMemo(() => {
        const t = searchParams.get('token');
        return t?.trim() || '';
    }, [searchParams]);

    const [loading, setLoading] = useState(false);

    const handleSendResetEmail = async (email: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
                email: email,
            });

            Swal.fire({
                text:
                    response.data.message ||
                    'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.',
                confirmButtonColor: '#7f0019',
                confirmButtonText: 'Đóng',
                width: '300px',
            });
        } catch (error: any) {
            const msg =
                error.response?.data?.message || 'Email không tồn tại hoặc có lỗi xảy ra';
            Swal.fire({
                title: 'Lỗi!',
                text: msg,
                icon: 'error',
                confirmButtonColor: '#333',
                confirmButtonText: 'Thử lại',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (newPassword: string) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/auth/reset-password`, {
                token: resetToken,
                new_password: newPassword,
            });

            await Swal.fire({
                text: response.data.message || 'Đặt lại mật khẩu thành công.',
                icon: 'success',
                confirmButtonColor: '#7f0019',
                confirmButtonText: 'Đăng nhập',
                width: '320px',
            });
            navigate('/login/', { replace: true });
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại email.';
            Swal.fire({
                title: 'Không đặt lại được mật khẩu',
                text: Array.isArray(msg) ? msg.join(', ') : msg,
                icon: 'error',
                confirmButtonColor: '#333',
                confirmButtonText: 'Đóng',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="forgot-password-main">
                <div className="forgot-password-flow">
                    <div
                        className="forgot-step-track"
                        role="progressbar"
                        aria-valuemin={1}
                        aria-valuemax={2}
                        aria-valuenow={resetToken ? 2 : 1}
                        aria-label="Tiến trình đặt lại mật khẩu: bước 1 là nhập email, bước 2 là đặt mật khẩu"
                    >
                        <div
                            className="forgot-step-fill"
                            style={{ width: resetToken ? '100%' : '50%' }}
                        />
                    </div>
                    <p className="forgot-step-caption">
                        {resetToken ? (
                            <>
                                <span className="forgot-step-num">Bước 2/2</span> Đặt mật khẩu mới
                            </>
                        ) : (
                            <>
                                <span className="forgot-step-num">Bước 1/2</span> Nhập email đăng ký
                            </>
                        )}
                    </p>
                    {resetToken ? (
                        <FormResetPassword
                            token={resetToken}
                            onSubmit={handleResetPassword}
                            isLoading={loading}
                        />
                    ) : (
                        <ForgotPasswordForm onSubmit={handleSendResetEmail} isLoading={loading} />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
