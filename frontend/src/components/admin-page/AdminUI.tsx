import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AdminUI.css';

const AdminUI: React.FC = () => {
    // State lưu cấu hình giao diện
    const [config, setConfig] = useState({
        productsPerPage: 12,
        productsPerRow: 4,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Giả lập load cấu hình từ localStorage hoặc API khi component mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('ui_config');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Giả lập gọi API lưu cấu hình
            localStorage.setItem('ui_config', JSON.stringify(config));

            await Swal.fire({
                title: 'Cập nhật thành công!',
                text: 'Các thay đổi về giao diện đã được áp dụng.',
                icon: 'success',
                confirmButtonColor: '#7f0019',
                width: '380px'
            });
        } catch (error) {
            Swal.fire('Lỗi!', 'Không thể lưu cấu hình.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý giao diện cửa hàng</h2>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="ui-config-container">
                <div className="config-grid">
                    <div className="config-item">
                        <label htmlFor="productsPerPage">Số lượng sản phẩm tối đa mỗi trang</label>
                        <input
                            type="number"
                            id="productsPerPage"
                            name="productsPerPage"
                            value={config.productsPerPage}
                            onChange={handleChange}
                            min="1"
                        />
                    </div>

                    <div className="config-item">
                        <label htmlFor="productsPerRow">Số lượng sản phẩm tối đa mỗi hàng</label>
                        <input
                            type="number"
                            id="productsPerRow"
                            name="productsPerRow"
                            value={config.productsPerRow}
                            onChange={handleChange}
                            min="1"
                            max="6"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUI;