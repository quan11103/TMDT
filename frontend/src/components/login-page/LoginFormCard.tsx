import React from 'react';
import './LoginFormCard.css';
import LoginCard from './LoginCard'; // Component đã build ở bước trước

const FormCard: React.FC = () => {
    return (
        <div className="form-card-wrapper">
            <div className="form-card-container">
                {/* Phần tử 1: CardTitle */}
                <div className="card-title">
                    Thành Viên Đăng Nhập
                </div>

                {/* Phần tử 2: Component LoginCard */}
                <LoginCard />
            </div>
        </div>
    );
};

export default FormCard;