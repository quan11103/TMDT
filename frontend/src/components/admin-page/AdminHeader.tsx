import React from 'react';
import './AdminHeader.css';

interface HeaderProps {
    title: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="admin-header">
            <h1 className="header-title">{title}</h1>
            <div className="header-user">
                <span className="user-name">Quản trị viên</span>
                <div className="user-avatar"></div>
            </div>
        </header>
    );
};

export default AdminHeader;