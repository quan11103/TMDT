// SignUpPage.tsx
import React from 'react';
import './SignUpPage.css';
import SignupFormCard from '../components/signup-page/SignupFormCard';
import Header from '../components/common/Header';

const SignUpPage: React.FC = () => {
    return (
        <>
            <Header />
            <SignupFormCard />
        </>
    );
};

export default SignUpPage;