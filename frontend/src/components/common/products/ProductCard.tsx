import React from 'react';
import './ProductCard.css';
import type { Product } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    const handleProductClick = () => {
        // Chuyển hướng sang trang chi tiết với id của sản phẩm
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="product-card" onClick={handleProductClick}>
            <div className="product-image">
                <img src={product.image} alt={product.name} />
            </div>
            <h3>{product.name}</h3>
            <div className="rating">
                {/* Render stars based on product.rating */}
                {/* <span>{product.rating}/5</span> */}
            </div>
            <div className="price-container">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && (
                    <span className="original-price">${product.originalPrice}</span>
                )}
                {product.discountPercent && (
                    <span className="discount-tag">-{product.discountPercent}%</span>
                )}
            </div>
        </div>
    );
};

export default ProductCard;