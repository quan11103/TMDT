import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { ProductDetail as ProductDetailType } from '../types'; // Đảm bảo bạn đã export type này
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductInfo from '../components/product-detail-page/ProductInfo';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductReviews from '../components/product-detail-page/ProductReviews';
import { fetchReviewSummary, type ReviewSummary } from '../lib/reviewsApi';
import './ProductDetailPage.css';
import { API_BASE } from '../lib/apiConfig';

const ProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();

    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE}/products/${productId}`);
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

    useEffect(() => {
        if (!productId) return;
        const id = Number(productId);
        let cancelled = false;
        fetchReviewSummary(id)
            .then((s) => {
                if (!cancelled) setReviewSummary(s);
            })
            .catch(() => {
                if (!cancelled) {
                    setReviewSummary({ product_id: id, count: 0, avg_rating: 0 });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [productId]);

    if (loading) return <div className="loading-screen" style={{ color: '#fff' }}>Đang tải...</div>;
    if (error || !product) return <div className="error-screen">{error || "Sản phẩm không tồn tại"}</div>;

    return (
        <>
            <Header />

            <div className="product-detail-page">
                <Breadcrumb
                    productName={product.name}
                    category={product.categories}
                />
                <ProductInfo product={product} reviewSummary={reviewSummary} />
                <ProductReviews
                    productId={product.id}
                    reviewSummary={reviewSummary}
                    onReviewChanged={setReviewSummary}
                />
            </div>

            <Footer />
        </>
    );
};

export default ProductDetail;