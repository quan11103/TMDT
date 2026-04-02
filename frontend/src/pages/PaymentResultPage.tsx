import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentResultPage.css';

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

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Chuyển toàn bộ query params từ VNPay về Backend để xác thực
                const query = Object.fromEntries(searchParams.entries());
                const response = await axios.get('http://localhost:3000/api/payment/vnpay-callback', {
                    params: query
                });

                setResult(response.data);
            } catch (error: any) {
                setResult({
                    success: false,
                    message: error.response?.data?.message || 'Không thể xác thực giao dịch.'
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
                        <button className="btn-secondary" onClick={() => navigate('/orders')}>
                            Xem đơn hàng
                        </button>
                    ) : (
                        <button className="btn-secondary" onClick={() => navigate('/checkout')}>
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