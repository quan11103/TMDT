// AdminHeader.tsx
import React from 'react';
import './AdminHeader.css';

const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
        <header className="admin-header">
            <h2 className="page-title">{title}</h2>
            <div className="header-actions">
                <img src="/images/avatar.svg" alt="admin" className="avatar-img" />
            </div>
        </header>
    );
};

export default AdminHeader;