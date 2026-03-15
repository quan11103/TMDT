import React, { useState } from 'react';
import './ProductTabs.css';

interface Props {
    description: string;
}

const ProductTabs: React.FC<Props> = ({ description }) => {
    const [activeTab, setActiveTab] = useState<string>('description');

    return (
        <div className="product-tabs-container">
            {/* Thanh tiêu đề Tab */}
            <div className="tabs-header">
                <button
                    className={`tab-item ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    Mô tả sản phẩm
                </button>
                <button
                    className={`tab-item ${activeTab === 'specification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('specification')}
                >
                    Thông số kỹ thuật / Kích thước
                </button>
            </div>

            {/* Nội dung Tab */}
            <div className="tabs-content">
                {activeTab === 'description' && (
                    <div className="tab-panel">
                        <div className="product-description-html" // Sử dụng dangerouslySetInnerHTML để render HTML nếu có, 
                            // hoặc hiển thị text thuần từ database
                            dangerouslySetInnerHTML={{ __html: description || "Đang cập nhật mô tả..." }}>
                        </div>
                    </div>
                )}

                {activeTab === 'specification' && (
                    <div className="tab-panel">
                        <div className="product-description-html">
                            <p><strong>Kích thước:</strong> Ngòi 0.5mm</p>
                            <p><strong>Chất liệu:</strong> Nhựa Polycarbonate</p>
                            <p><strong>Màu mực:</strong> Xanh dương</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductTabs;