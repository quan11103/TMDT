import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './PaymentResultPage.css';
import { API_BASE } from '../lib/apiConfig';

interface PaymentStatus {
    success: boolean;
    message: string;
    order_id?: number;
}

const PaymentResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<PaymentStatus | null>(null);

    const handleRetryPayment = async () => {
        const orderIdStr = searchParams.get('vnp_OrderInfo');
        const orderId = orderIdStr ? Number(orderIdStr) : result?.order_id;

        if (!orderId) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không tìm thấy thông tin đơn hàng để thanh toán lại.',
                confirmButtonColor: '#7b0f1a'
            });
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            Swal.fire('Lỗi', 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            navigate('/login');
            return;
        }

        try {
            Swal.fire({
                title: 'Đang chuẩn bị thanh toán...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await axios.post(`${API_BASE}/payment`, {
                order_id: orderId,
                method: 'VNPAY'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.close();

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                throw new Error('Không nhận được liên kết thanh toán từ VNPay');
            }
        } catch (error: any) {
            console.error("Lỗi khi thanh toán lại:", error);
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo liên kết thanh toán',
                confirmButtonColor: '#7b0f1a'
            });
        }
    };

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Chuyển toàn bộ query params từ VNPay về Backend để xác thực
                const query = Object.fromEntries(searchParams.entries());
                const response = await axios.get(`${API_BASE}/payment/vnpay/callback`, {
                    params: query,
                });

                setResult(response.data);
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } | string; status?: number } };
                const data = err.response?.data;
                const apiMsg =
                    typeof data === 'object' && data !== null && 'message' in data
                        ? String((data as { message: string }).message)
                        : typeof data === 'string'
                          ? data
                          : '';
                setResult({
                    success: false,
                    message:
                        apiMsg ||
                        (err.response?.status === 404
                            ? 'Không tìm thấy API xác thực thanh toán. Kiểm tra backend đang chạy và đúng đường dẫn.'
                            : 'Không thể xác thực giao dịch.'),
                });
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="result-container">
                <div className="result-card">
                    <div className="result-spinner"></div>
                    <p>Đang xác nhận kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    const isSuccess = result?.success;

    return (
        <div className="result-container">
            <div className={`result-card ${isSuccess ? 'success' : 'failure'}`}>
                <div className="result-icon">
                    {isSuccess ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                </div>

                <h2 className="result-title">
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h2>

                <p className="result-message">{result?.message}</p>

                {isSuccess && result?.order_id && (
                    <p className="order-number">Mã đơn hàng: <strong>#{result.order_id}</strong></p>
                )}

                <div className="result-actions">
                    {isSuccess ? (
                        <button className="btn-secondary" onClick={() => navigate('/order-status/', { state: { activeTab: 'CONFIRMED' } })}>
                            Xem đơn hàng
                        </button>
                    ) : (
                        <button className="btn-secondary" onClick={handleRetryPayment}>
                            Thử lại
                        </button>
                    )}
                    <button className="btn-secondary" onClick={() => navigate('/')}>
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;