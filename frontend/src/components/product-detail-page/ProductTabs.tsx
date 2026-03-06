import React, { useState } from 'react';
import './ProductTabs.css';

const ProductTabs: React.FC = () => {
    // State để quản lý tab nào đang hiển thị
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
                        <div className="product-description-html">
                            <p>Dòng bút bấm Gel có thiết kế đặc biệt để có thể dễ dàng thay thế ruột. Thân bút được kết hợp với ruột của bút bấm Gel để mang lại nét viết mượt mà.</p>
                            <p>Thân Polycacbonat 100%, Trên & Đầu: Abs 100%, Lò Xo, Vít Thép 100%, Khớp Nối Lõi Nhựa Pp 100%</p>
                            <p>Sản Xuất Tại Nhật Bản</p>
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