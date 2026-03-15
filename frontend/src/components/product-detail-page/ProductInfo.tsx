import React, { useState } from 'react';
import axios from 'axios';
import type { ProductDetail } from '../../types';
import QuantitySelector from '../common/QuantitySelector';
import './ProductInfo.css';

interface Props {
    product: ProductDetail;
}

const ProductInfo: React.FC<Props> = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [isAdding, setIsAdding] = useState(false);

    const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price);

    const handleAddToCart = async () => {
        const finalQuantity = Number(quantity) || 1; // Fallback về 1 nếu đang trống
        const token = localStorage.getItem("access_token");

        // 1. Kiểm tra đăng nhập
        if (!token) {
            alert("Vui lòng đăng nhập để mua hàng!");
            return;
        }

        setIsAdding(true);

        try {
            // 2. Gửi request tới API (khớp với AddToCartDto ở Backend)
            const response = await axios.post(
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

            // 3. Thông báo thành công
            alert(`Đã thêm thành công ${finalQuantity} sản phẩm vào giỏ hàng!`);

        } catch (err: any) {
            // 4. Xử lý lỗi (ví dụ: kho không đủ, sản phẩm hết hàng)
            console.error("Lỗi thêm vào giỏ:", err.response?.data);
            const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.";
            alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="product-container">
            {/* GALLERY */}
            <div className="product-gallery">
                <div className="gallery-main">
                    <img
                        src={product.product_images[activeIndex]?.image_url || 'https://via.placeholder.com/500'}
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
                            <img src={img.image_url} alt={`thumb-${index}`} />
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

                <div className="product-controls">
                    <QuantitySelector
                        quantity={quantity}
                        onChange={setQuantity}
                    />

                    <div className="action-buttons">
                        <button
                            className={`btn-add-cart ${isAdding ? 'loading' : ''}`}
                            disabled={product.stock <= 0 || isAdding}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? "Đang xử lý..." : (product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;