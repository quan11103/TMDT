import React from 'react';
import './SignupFormCard.css';
import SignupCard from './SignupCard'; // Component chứa form đăng ký và footer quay lại đăng nhập

const SignupFormCard: React.FC = () => {
    return (
        <div className="form-card-wrapper">
            <div className="form-card-container">
                {/* Phần tử 1: CardTitle - Đã đổi text sang Đăng Ký */}
                <div className="card-title">
                    Đăng Ký Tài Khoản
                </div>

                {/* Phần tử 2: Component SignupCard */}
                <SignupCard />
            </div>
        </div>
    );
};

export default SignupFormCard;