import React from 'react';
import type { PaginationMeta } from '../../types';
import ProductGrid from '../common/products/ProductGrid';
import Pagination from '../common/Pagination';
import './SearchMain.css';

interface Props {
    productIds?: number[];
    paginationMeta?: PaginationMeta;
    onPageChange?: (newPage: number) => void; // Hàm để load trang mới
    productsPerRow?: number;
    sort?: string;
    onSortChange?: (nextSort: string) => void;
}

const CategoryMain: React.FC<Props> = ({ productIds, paginationMeta, onPageChange, productsPerRow, sort = 'newest', onSortChange }) => {
    return (
        <main className="category-main">
            <div className="category-container">
                <div className="sort-row">
                    <label htmlFor="search-sort-select">Sắp xếp:</label>
                    <select
                        id="search-sort-select"
                        className="sort-select"
                        value={sort}
                        onChange={(e) => onSortChange?.(e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá thấp đến cao</option>
                        <option value="price_desc">Giá cao đến thấp</option>
                    </select>
                </div>

                {/* Phần hiển thị danh sách sản phẩm */}
                <section className="product-section">
                    <ProductGrid productIds={productIds} columnsDesktop={productsPerRow} />
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