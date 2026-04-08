import React, { useState } from 'react';
import axios from 'axios';
import type { ProductDetail } from '../../types';
import QuantitySelector from '../common/QuantitySelector';
import './ProductInfo.css';
import { mediaUrl } from '../../lib/mediaUrl';

interface Props {
    product: ProductDetail;
}

const ProductInfo: React.FC<Props> = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [isAdded, setIsAdded] = useState(false);

    const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price);
    const mainGallerySrc = product.product_images[activeIndex]?.image_url;

    const handleAddToCart = async () => {
        const finalQuantity = Number(quantity) || 1;
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("Vui lòng đăng nhập để mua hàng!");
            return;
        }

        try {
            await axios.post(
                "http://localhost:3000/api/cart",
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

                <div className="product-rating">
                    <div className="rating-stars">★★★★★</div>
                    <strong className="review-score">5.0<span className="score-max">/ 5</span></strong>
                    <div className="review-count">(2 Đánh giá)</div>
                </div>

                <div className="product-price">
                    <span className="price-value">{formattedPrice}</span>
                    <span className="price-currency">VND</span>
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