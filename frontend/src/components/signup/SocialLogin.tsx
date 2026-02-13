// SocialLogin.tsx
import React from 'react';
import './SocialLogin.css';

const SocialLogin: React.FC = () => {
    return (
        <div className="social-group">
            <button className="btn-social">
                <img src="/logos/google.svg" alt="google" />
                Google
            </button>
            <button className="btn-social">
                <img src="/logos/facebook.svg" alt="facebook" />
                Facebook
            </button>
        </div>
    );
};

export default SocialLogin;