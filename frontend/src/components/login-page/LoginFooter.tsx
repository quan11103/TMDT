import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginFooter.css';

const LoginFooter: React.FC = () => {
    const navigate = useNavigate();

    const handleSignupClick = () => {
        navigate(`/signup/`);
    };

    return (
        <div className="register-footer">
            <h3 className="footer-title">Thành viên mới tại MUJI?</h3>

            <p className="footer-description">
                Hãy tham gia cùng chúng tôi để nhận được thông báo về ưu đãi mới và mã giảm giá hấp dẫn.
            </p>

            <button className="btn-outline-register" onClick={handleSignupClick}>
                Đăng ký thành viên mới
            </button>
        </div>
    );
};

export default LoginFooter;