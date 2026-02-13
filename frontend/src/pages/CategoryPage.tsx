import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FilterSidebar from '../components/category/FilterSidebar';
import Pagination from '../components/common/Pagination';
import ProductList from '../components/sections/ProductList';
import './CategoryPage.css';

const CategoryPage: React.FC = () => {
    // Dữ liệu mẫu 9 sản phẩm (Lưới 3x3)
    const products = Array(9).fill({
        id: 1, name: "Gradient Graphic T-shirt", price: 145, rating: 3.5, image: "/images/p10.svg"
    });

    return (
        <>
            <Header />
            <div className="category-page">
                <nav className="breadcrumbs">
                    <span>Home &nbsp; </span>
                    <img src="/icons/arrow-right.svg" alt="arrow" />
                    <span className="current"> &nbsp; Casual</span>
                </nav>

                <div className="category-main">
                    <FilterSidebar />

                    <section className="product-results">
                        <div className="results-header">
                            <h2>Casual</h2>
                            <div className="results-meta">
                                <span>Showing 1-10 of 100 Products</span>
                                <div className="sort-by">
                                    Sort by: <strong>Most Popular <img src="/icons/chevron-down.svg" alt="down" className="icon-img-small" style={{ marginBottom: "5px", cursor: "pointer" }} /></strong>
                                </div>
                            </div>
                        </div>

                        <ProductList products={products} />

                        <hr className="divider" />
                        <Pagination />
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CategoryPage;