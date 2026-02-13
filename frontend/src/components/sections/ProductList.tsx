import React from 'react';
import type { Product } from '../../types';
import ProductCard from '../common/ProductCard'; // Đảm bảo bạn đã có file này từ câu trả lời trước
import './ProductList.css';

interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
    return (
        <div className="product-list">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductList;