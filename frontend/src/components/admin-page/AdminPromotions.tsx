import React, { useState } from 'react';
import './AdminPromotions.css';

// --- MOCK DATA (Thay thế bằng data từ API dựa trên Prisma Schema của bạn) ---
const mockCategories = [
    { id: 1, name: 'Bút / Viết' },
    { id: 2, name: 'Sổ tay' },
    { id: 3, name: 'Đồ gia dụng' }
];

const mockRoles = [
    { id: 1, role: 'ADMIN' },
    { id: 2, role: 'MEMBER' },
    { id: 3, role: 'VIP' }
];

interface Promotion {
    id: number;
    code: string;
    discount_value: number;
    discount_type: 'PERCENT' | 'FIXED';
    target_category_id: number | null; // null = Tất cả sản phẩm
    target_role_id: number | null;     // null = Tất cả người dùng
    valid_until: string;
    is_active: boolean;
}

const initialPromotions: Promotion[] = [
    { id: 1, code: 'MUJINEW', discount_value: 10, discount_type: 'PERCENT', target_category_id: null, target_role_id: 2, valid_until: '2026-12-31', is_active: true },
    { id: 2, code: 'PEN50K', discount_value: 50000, discount_type: 'FIXED', target_category_id: 1, target_role_id: null, valid_until: '2026-06-30', is_active: true },
    { id: 3, code: 'VIPONLY', discount_value: 20, discount_type: 'PERCENT', target_category_id: null, target_role_id: 3, valid_until: '2025-01-01', is_active: false },
];

const AdminPromotions: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Xử lý hiển thị tên nhóm
    const getTargetProductName = (categoryId: number | null) => {
        if (!categoryId) return 'Tất cả sản phẩm';
        const cat = mockCategories.find(c => c.id === categoryId);
        return cat ? `Danh mục: ${cat.name}` : 'Không xác định';
    };

    const getTargetUserName = (roleId: number | null) => {
        if (!roleId) return 'Tất cả khách hàng';
        const role = mockRoles.find(r => r.id === roleId);
        return role ? `Hạng: ${role.role}` : 'Không xác định';
    };

    const formatCurrency = (val: number, type: 'PERCENT' | 'FIXED') => {
        if (type === 'PERCENT') return `-${val}%`;
        return `-${new Intl.NumberFormat('vi-VN').format(val)}đ`;
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý khuyến mãi</h2>
                <button
                    className="btn-primary"
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    style={{ backgroundColor: isFormOpen ? '#333' : '#7f0019' }}
                >
                    {isFormOpen ? 'Đóng Form' : '+ Thêm mã mới'}
                </button>
            </div>

            {/* FORM THÊM MỚI (Mở ra khi bấm nút) */}
            {isFormOpen && (
                <div className="promo-form-container">
                    <h3 className="form-title">Tạo mã khuyến mãi mới</h3>
                    <div className="promo-form-grid">
                        <div className="form-group">
                            <label>Mã giảm giá (Code)</label>
                            <input type="text" placeholder="VD: SUMMER26" className="muji-input" />
                        </div>
                        <div className="form-group row">
                            <div className="col">
                                <label>Loại giảm</label>
                                <select className="muji-input">
                                    <option value="PERCENT">% Phần trăm</option>
                                    <option value="FIXED">VNĐ Trực tiếp</option>
                                </select>
                            </div>
                            <div className="col">
                                <label>Mức giảm</label>
                                <input type="number" placeholder="10" className="muji-input" />
                            </div>
                        </div>

                        {/* --- PHẦN CHỌN NHÓM DỰA TRÊN DATABASE --- */}
                        <div className="form-group">
                            <label>Nhóm Sản phẩm áp dụng (Theo Category)</label>
                            <select className="muji-input">
                                <option value="ALL">Tất cả sản phẩm</option>
                                {mockCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>Chỉ danh mục: {cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nhóm Khách hàng áp dụng (Theo Role)</label>
                            <select className="muji-input">
                                <option value="ALL">Tất cả khách hàng</option>
                                {mockRoles.filter(r => r.role !== 'ADMIN').map(role => (
                                    <option key={role.id} value={role.id}>Chỉ hạng: {role.role}</option>
                                ))}
                            </select>
                        </div>
                        {/* -------------------------------------- */}

                        <div className="form-group">
                            <label>Hạn sử dụng</label>
                            <input type="date" className="muji-input" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary">LƯU KHUYẾN MÃI</button>
                    </div>
                </div>
            )}

            {/* BẢNG HIỂN THỊ */}
            <table className="muji-table">
                <thead>
                    <tr>
                        <th className="text-left">MÃ GIẢM GIÁ</th>
                        <th>MỨC GIẢM</th>
                        <th className="text-left">NHÓM SẢN PHẨM</th>
                        <th className="text-left">NHÓM KHÁCH HÀNG</th>
                        <th>HẠN SỬ DỤNG</th>
                        <th>TRẠNG THÁI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((promo) => (
                        <tr key={promo.id}>
                            <td className="text-left font-medium promo-code">{promo.code}</td>
                            <td className="price font-medium" style={{ color: '#7f0019' }}>
                                {formatCurrency(promo.discount_value, promo.discount_type)}
                            </td>
                            <td className="text-left">
                                <span className="group-tag">{getTargetProductName(promo.target_category_id)}</span>
                            </td>
                            <td className="text-left">
                                <span className="group-tag">{getTargetUserName(promo.target_role_id)}</span>
                            </td>
                            <td>{new Date(promo.valid_until).toLocaleDateString('vi-VN')}</td>
                            <td>
                                {promo.is_active ? (
                                    <span className="status-badge active">Đang chạy</span>
                                ) : (
                                    <span className="status-badge expired">Đã hết hạn</span>
                                )}
                            </td>
                            <td>
                                <div className="table-actions">
                                    <span className="action-badge edit">Sửa</span>
                                    <span className="action-badge delete">Vô hiệu</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPromotions;