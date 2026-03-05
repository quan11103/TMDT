import React from 'react';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import './CategoryMain.css';

const CategoryMain: React.FC = () => {
    return (
        <main className="category-main">
            <div className="category-container">
                {/* Phần hiển thị danh sách sản phẩm */}
                <section className="product-section">
                    <ProductGrid />
                </section>

                {/* Phần điều hướng trang */}
                <footer className="pagination-section">
                    <Pagination />
                </footer>
            </div>
        </main>
    );
};

export default CategoryMain;