// AuthDivider.tsx
import React from 'react';
import './AuthDivider.css';

const AuthDivider: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="auth-divider">
            <span>{text}</span>
        </div>
    );
};

export default AuthDivider;