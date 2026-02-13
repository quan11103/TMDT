// AuthInput.tsx
import React from 'react';
import './AuthInput.css';

interface AuthInputProps {
    type: string;
    placeholder: string;
    icon: string;
    required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ type, placeholder, icon, required = true }) => {
    return (
        <div className="auth-input-group">
            <img src={icon} alt="icon" className="auth-icon" />
            <input type={type} placeholder={placeholder} required={required} />
        </div>
    );
};

export default AuthInput;