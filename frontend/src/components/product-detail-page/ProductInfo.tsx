import React, { useState } from 'react';
import axios from 'axios';
import type { ProductDetail } from '../../types';
import QuantitySelector from '../common/QuantitySelector';
import './ProductInfo.css';
import { mediaUrl } from '../../lib/mediaUrl';
import type { ReviewSummary } from '../../lib/reviewsApi';
import { API_BASE } from '../../lib/apiConfig';

interface Props {
    product: ProductDetail;
    reviewSummary: ReviewSummary | null;
}

const ProductInfo: React.FC<Props> = ({ product, reviewSummary }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [isAdded, setIsAdded] = useState(false);

    const hasSale = typeof product.discount_percent === 'number' && product.discount_percent > 0;
    const displayPrice = hasSale ? product.sale_price! : product.price;
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(displayPrice);
    const formattedOriginalPrice = new Intl.NumberFormat('vi-VN').format(product.price);
    const mainGallerySrc = product.product_images[activeIndex]?.image_url;

    const reviewCount = reviewSummary?.count ?? 0;
    const avgRating = reviewSummary?.avg_rating ?? 0;
    const roundedStars = reviewCount > 0 ? Math.round(avgRating) : 0;

    const handleAddToCart = async () => {
        const finalQuantity = Number(quantity) || 1;
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("Vui lòng đăng nhập để mua hàng!");
            return;
        }

        try {
            await axios.post(
                `${API_BASE}/cart`,
                {
                    product_id: product.id,
                    quantity: finalQuantity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            window.dispatchEvent(new Event('cartUpdated'));
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 3000);
        } catch (err: any) {
            console.error("Lỗi thêm vào giỏ:", err.response?.data);
            const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.";
            alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        }
    };

    return (
        <div className="product-container">
            {/* GALLERY */}
            <div className="product-gallery">
                <div className="gallery-main">
                    <img
                        src={mainGallerySrc ? mediaUrl(mainGallerySrc) : 'https://via.placeholder.com/500'}
                        alt={product.name}
                    />
                </div>
                <div className="gallery-thumbs">
                    {product.product_images.map((img, index) => (
                        <div
                            key={img.id}
                            className={`thumb-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                        >
                            <img src={mediaUrl(img.image_url)} alt={`thumb-${index}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* INFO */}
            <div className="product-details">
                <h1 className="product-title">{product.name}</h1>

                <div className="product-meta">
                    <div className="meta-left">
                        <span className="sku"><strong>Danh mục:</strong> {product.categories.name}</span>
                        <span className="stock" style={{ marginLeft: '15px' }}>
                            <strong>Kho:</strong> {product.stock > 0 ? product.stock : "Hết hàng"}
                        </span>
                    </div>
                </div>

                {reviewCount > 0 ? (
                    <div className="product-rating" aria-label="Điểm đánh giá">
                        <div className="rating-stars" aria-hidden>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <span key={n} className={n <= roundedStars ? 'star-on' : 'star-off'}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <strong className="review-score">
                            {avgRating.toFixed(1)}
                            <span className="score-max">/ 5</span>
                        </strong>
                        <div className="review-count">({reviewCount} đánh giá)</div>
                    </div>
                ) : (
                    <div className="product-rating product-rating--empty">
                        Chưa có đánh giá nào
                    </div>
                )}

                <div className="product-price" style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    {hasSale ? (
                        <>
                            {/* Giá gốc hiển thị trước: màu xám, gạch ngang, không có chữ VND */}
                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px', fontWeight: 'normal' }}>
                                {formattedOriginalPrice}
                            </span>
                            
                            {/* Giá ưu đãi hiển thị sau: màu đỏ đậm, cỡ to, có chữ VND */}
                            <span className="price-value" style={{ color: '#7f0019', fontSize: '28px', fontWeight: 'bold' }}>{formattedPrice}</span>
                            <span className="price-currency" style={{ color: '#7f0019', fontSize: '15px', fontWeight: 'normal' }}>VND</span>
                            
                            {/* Phần trăm giảm: không bị gạch ngang, trong ngoặc */}
                            <span style={{ color: '#7f0019', fontWeight: 'bold', fontSize: '18px', marginLeft: '5px' }}>
                                (-{product.discount_percent}%)
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="price-value">{formattedPrice}</span>
                            <span className="price-currency">VND</span>
                        </>
                    )}
                </div>

                {/* --- PHẦN MÔ TẢ ĐƯỢC CHUYỂN TỪ TABS SANG --- */}
                <div className="product-short-description">
                    <h3 className="description-label">Mô tả sản phẩm:</h3>
                    <div
                        className="product-description-html"
                        dangerouslySetInnerHTML={{ __html: product.description || "Đang cập nhật mô tả..." }}
                    ></div>
                </div>
                {/* ------------------------------------------- */}

                <div className="product-controls">
                    <QuantitySelector
                        quantity={quantity}
                        onChange={setQuantity}
                        max={product.stock}
                    />

                    <div className="action-buttons">
                        <button
                            className={`btn-add-cart ${isAdded ? 'added' : ''}`}
                            disabled={product.stock <= 0 || isAdded}
                            onClick={handleAddToCart}
                        >
                            {isAdded
                                ? "Đã thêm vào giỏ"
                                : (product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;