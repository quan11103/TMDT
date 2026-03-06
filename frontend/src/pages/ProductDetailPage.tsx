import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductInfo from '../components/product-detail-page/ProductInfo';
import ProductTabs from '../components/product-detail-page/ProductTabs';
import './ProductDetailPage.css';
import '../components/common/Breadcrumb.css';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductReviews from '../components/product-detail-page/ProductReviews';

const ProductDetail: React.FC = () => {

    return (
        <>
            <Header />

            <div className="product-detail-page">
                <Breadcrumb />
                <ProductInfo />
                <ProductTabs />
                <ProductReviews />
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;