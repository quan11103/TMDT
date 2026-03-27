import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ForgotPasswordForm from '../components/forgot-password-page/FormForgotPassword';
import axios from 'axios';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleSendResetEmail = async (email: string) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
                email: email
            });

            alert(response.data.message || "Vui lòng kiểm tra email của bạn!");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Email không tồn tại hoặc có lỗi xảy ra";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="forgot-password-main">
                <ForgotPasswordForm
                    onSubmit={handleSendResetEmail}
                    isLoading={loading}
                />
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;