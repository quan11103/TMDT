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

                    <button
                        className="wishlist-btn"
                        title="Thêm vào danh sách yêu thích"
                        aria-label="Thêm vào danh sách yêu thích"
                    >
                        <svg
                            fill="none"
                            height="16"
                            viewBox="0 0 16 16"
                            width="16"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.7051 1.43839C8.9287 1.09167 8.10676 3.21885 7.96063 3.71551C7.96063 3.74362 7.91497 3.74362 7.90583 3.71551C7.75058 3.21885 6.93776 1.09167 4.16141 1.43839C0.636171 1.87882 -0.0396513 6.38621 1.77776 8.5134C3.01068 9.94714 6.50853 13.5737 7.61359 14.7263C7.78711 14.9043 8.06109 14.9043 8.23461 14.7263C9.33968 13.5737 12.8193 9.91903 14.0796 8.5134C15.8605 6.50803 15.2212 1.87882 11.7051 1.44776V1.43839Z"
                                fill="white"
                                stroke="#E0CEAA"
                                strokeMiterlimit="10"
                            />
                        </svg>
                    </button>
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