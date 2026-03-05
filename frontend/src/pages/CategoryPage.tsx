import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './CategoryPage.css';
import Breadcrumb from '../components/common/Breadcrumb';
import CategoryContainer from '../components/category-page/CategoryContainer';

const CategoryPage: React.FC = () => {

    return (
        <>
            <Header />
            <div className="category-page">
                <Breadcrumb />
                <CategoryContainer />
            </div>
            <Footer />
        </>
    );
};

export default CategoryPage;