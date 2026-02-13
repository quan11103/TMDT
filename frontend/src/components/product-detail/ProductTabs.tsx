import React, { useState } from 'react';
import './ProductTabs.css';

// Định nghĩa các loại tab
type TabType = 'details' | 'reviews' | 'faq';

const ProductTabs: React.FC = () => {
    // Mặc định chọn tab Reviews giống như trong thiết kế mẫu
    const [activeTab, setActiveTab] = useState<TabType>('reviews');

    return (
        <section className="product-tabs-section">
            {/* 1. Phần Tiêu đề Tabs */}
            <div className="tabs-header">
                <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Product Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Rating & Reviews
                </button>
                <button
                    className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faq')}
                >
                    FAQs
                </button>
            </div>

            <hr className="tabs-divider" />

            {/* 2. Phần Nội dung thay đổi theo Tab */}
            <div className="tabs-content">
                {activeTab === 'details' && (
                    <div className="tab-pane">
                        <h3>Product Specifications</h3>
                        <p>Material: 100% Cotton. Made in Vietnam. Machine wash cold.</p>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="tab-pane reviews-pane">
                        {/* Header của phần Review: Tiêu đề + Các nút lọc */}
                        <div className="reviews-header">
                            <h3>All Reviews <span className="review-count">(451)</span></h3>
                            <div className="reviews-actions">
                                {/* Nút Filter tròn */}
                                <button className="btn-circle">
                                    <img src="/icons/filter.svg" alt="Filter" />
                                </button>
                                {/* Nút Dropdown Latest */}
                                <button className="btn-dropdown">
                                    Latest <img src="/icons/chevron-down.svg" alt="down" className="icon-img-small" style={{ marginTop: "5px" }} />
                                </button>
                                {/* Nút Write Review màu đen */}
                                <button className="btn-write-review">Write a Review</button>
                            </div>
                        </div>

                        {/* Lưu ý: Grid chứa các ReviewCard sẽ được đặt ở component cha hoặc render ngay tại đây */}
                        <div className="reviews-placeholder">
                            {/* Bạn sẽ chèn component <ReviewList /> hoặc map <ReviewCard /> vào đây */}
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="tab-pane">
                        <h3>Frequently Asked Questions</h3>
                        <p>Q: How do I choose the right size?</p>
                        <p>A: Please refer to our size chart available in the product description.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductTabs;