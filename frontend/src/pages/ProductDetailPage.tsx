import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { ProductDetail as ProductDetailType } from '../types'; // Đảm bảo bạn đã export type này
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductInfo from '../components/product-detail-page/ProductInfo';
import ProductTabs from '../components/product-detail-page/ProductTabs';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductReviews from '../components/product-detail-page/ProductReviews';
import './ProductDetailPage.css';

const ProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();

    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/products/${productId}`);
                setProduct(response.data);
            } catch (err: any) {
                setError("Không thể tải thông tin sản phẩm.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return <div className="loading-screen">Đang tải sản phẩm...</div>;
    if (error || !product) return <div className="error-screen">{error || "Sản phẩm không tồn tại"}</div>;

    return (
        <>
            <Header />

            <div className="product-detail-page">
                <Breadcrumb
                    productName={product.name}
                    category={product.categories}
                />
                <ProductInfo product={product} />
                <ProductTabs description={product.description} />
                <ProductReviews />
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;