import React from 'react';
import type { Product } from '../../types';
import './ProductItem.css'; // Import file CSS tương ứng
import { useNavigate } from 'react-router-dom';

interface ProductItemProps {
    product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
    const { name, price, imageUrl, productUrl } = product;
    const currency = 'VND';

    // Hàm format giá tiền (VD: 981000 -> 981.000)
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);

    const navigate = useNavigate();

    const handleProductClick = () => {
        // Chuyển hướng sang trang chi tiết với id của sản phẩm
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="product-item" onClick={handleProductClick}>
            {/* Phần Hình ảnh & Nhãn */}
            <div className="product-image-container">
                <a href={productUrl} title={name} className="product-image-link">
                    <img
                        src={imageUrl}
                        alt={name}
                        loading="lazy"
                        className="product-image"
                    />
                </a>
            </div>

            {/* Phần Thông tin sản phẩm */}
            <div className="product-info-container">
                {/* Tên sản phẩm */}
                <p className="product-name">
                    <a href={productUrl} title={name}>
                        {name}
                    </a>
                </p>

                {/* Giá và Nút Yêu thích */}
                <div className="product-price-wishlist">
                    <div className="product-price">
                        <span className="amount">{formattedPrice}</span>
                        <span className="currency">{currency}</span>
                    </div>
                </div>

                {/* Nút Mua Hàng */}
                <a href={productUrl} className="add-to-cart-btn" title={name}>
                    Mua Hàng
                </a>
            </div>
        </div>
    );
};

export default ProductItem;