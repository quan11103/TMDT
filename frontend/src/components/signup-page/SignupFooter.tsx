import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupFooter.css';

const SignupFooter: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate(`/login`);
    };

    return (
        <div className="signup-footer">
            <strong className="footer-status">Đã có tài khoản</strong>

            <button className="btn-outline-login" onClick={handleLoginClick}>
                Đăng Nhập Ngay
            </button>
        </div>
    );
};

export default SignupFooter;