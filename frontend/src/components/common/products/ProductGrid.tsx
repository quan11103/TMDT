import React from 'react';
import './ProductGrid.css';
import ProductItem from './ProductItem';

interface Props {
    productIds?: number[];
    /** Số cột tối đa trên màn hình lớn (từ store settings). Không truyền → dùng CSS mặc định. */
    columnsDesktop?: number;
}

const ProductGrid: React.FC<Props> = ({ productIds, columnsDesktop }) => {
    const cols = columnsDesktop != null ? Math.min(12, Math.max(1, Math.floor(columnsDesktop))) : undefined;
    const gridStyle =
        cols != null
            ? ({
                  ['--pg-cols' as string]: String(cols),
              } as React.CSSProperties)
            : undefined;

    return (
        <div className="grid-container">
            <div
                className={`product-grid${cols != null ? ' product-grid--store' : ''}`}
                style={gridStyle}
            >
                {productIds?.map((id) => (
                    <ProductItem key={id} Id={id} />
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;