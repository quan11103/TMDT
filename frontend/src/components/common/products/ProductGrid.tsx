import React from 'react';
import './ProductGrid.css';
import ProductItem from './ProductItem';

interface Props {
    productIds?: number[];
}

const ProductGrid: React.FC<Props> = ({ productIds }) => {
    return (
        <div className="grid-container">
            <div className="product-grid">
                {productIds?.map((id) => (
                    <ProductItem Id={id} />
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;