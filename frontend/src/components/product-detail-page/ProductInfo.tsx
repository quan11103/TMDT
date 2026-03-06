import React, { useState } from 'react';
import QuantitySelector from '../common/QuantitySelector'; // Import component vừa tạo
import './ProductInfo.css';

const ProductInfo: React.FC = () => {
    const productImages = [
        "https://api.muji.com.vn/media/catalog/product/cache/2e9290695da361a7d6192a4c8c689807/4/5/4550002794132_org.jpg",
        "https://api.muji.com.vn/media/catalog/product/cache/2e9290695da361a7d6192a4c8c689807/4/5/4550002794132_01_org.jpg"
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState<string>("1");

    return (
        <div className="product-container">
            {/* GALLERY */}
            <div className="product-gallery">
                <div className="gallery-main">
                    <img src={productImages[activeIndex]} alt="Product Main" />
                </div>
                <div className="gallery-thumbs">
                    {productImages.map((imgUrl, index) => (
                        <div
                            key={index}
                            className={`thumb-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                        >
                            <img src={imgUrl} alt={`thumb-${index}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* INFO */}
            <div className="product-details">
                <h1 className="product-title">Bút Bi Bấm 0.5mm - Xanh Dương MUJI</h1>

                <div className="product-meta">
                    <div className="meta-left">
                        <span className="sku"><strong>SKU:</strong> 4550002794132</span>
                        <span className="sold">(1740 Đã bán)</span>
                    </div>
                </div>

                <div className="product-rating">
                    <div className="rating-stars">★★★★★</div>
                    <strong className="review-score">5.0<span className="score-max">/ 5</span></strong>
                    <div className="review-count">(2 Đánh giá)</div>
                </div>

                <div className="product-price">
                    <span className="price-value">25.000</span>
                    <span className="price-currency">VND</span>
                </div>

                <div className="product-controls">
                    {/* Sử dụng Component đã tách */}
                    <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                    />

                    <div className="action-buttons">
                        <button className="btn-add-cart">Thêm vào giỏ hàng</button>
                        <button className="btn-quick-buy">Mua nhanh</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;