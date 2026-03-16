import React from 'react';
import type { PaginationMeta } from '../../types';
import ProductGrid from '../common/products/ProductGrid';
import Pagination from '../common/Pagination';
import './SearchMain.css';

interface Props {
    productIds?: number[];
    paginationMeta?: PaginationMeta;
    onPageChange?: (newPage: number) => void; // Hàm để load trang mới
}

const CategoryMain: React.FC<Props> = ({ productIds, paginationMeta, onPageChange }) => {
    return (
        <main className="category-main">
            <div className="category-container">
                {/* Phần hiển thị danh sách sản phẩm */}
                <section className="product-section">
                    <ProductGrid productIds={productIds} />
                </section>

                {/* Phần điều hướng trang */}
                <footer className="pagination-section">
                    {paginationMeta && (
                        <Pagination
                            current={paginationMeta.page}
                            total={paginationMeta.total_page}
                            onChange={onPageChange}
                        />
                    )}
                </footer>
            </div>
        </main>
    );
};

export default CategoryMain;